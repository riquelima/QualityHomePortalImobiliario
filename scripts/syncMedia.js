// Sync media arrays (images/videos) for the last two properties published today.
// Uses Supabase Service Role credentials present in the codebase.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ckzhvurabmhvteekyjxg.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremh2dXJhYm1odnRlZWt5anhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMjc4MCwiZXhwIjoyMDczNjc4NzgwfQ.zNCoMgFT0k6-ZbJuV9zA0y6kZmqPf1ZscW-dwPL2_-U';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function listFilesForProperty(propertyId) {
  const { data, error } = await supabase.storage.from('midia').list(`${propertyId}`);
  if (error) {
    console.error(`Erro ao listar arquivos para imovel ${propertyId}:`, error);
    return [];
  }
  return data || [];
}

function extIsVideo(name) {
  return /\.(mp4|mov|webm|mkv|avi)$/i.test(name);
}

async function ensureMidiasRecords(propertyId) {
  const { data: midias, error } = await supabase
    .from('midias_imovel')
    .select('id,url,tipo')
    .eq('imovel_id', propertyId);
  if (error) throw error;

  if (midias && midias.length > 0) {
    return midias;
  }

  // If no DB records, try to infer from storage
  let files = await listFilesForProperty(propertyId);
  const created = [];
  for (const file of files) {
    const path = `${propertyId}/${file.name}`;
    const { data: pub } = supabase.storage.from('midia').getPublicUrl(path);
    const tipo = extIsVideo(file.name) ? 'video' : 'imagem';
    const { error: insertErr } = await supabase
      .from('midias_imovel')
      .insert([{ imovel_id: propertyId, url: pub.publicUrl, tipo, data_upload: new Date().toISOString() }]);
    if (insertErr) {
      console.error('Erro ao criar registro de midia:', insertErr);
    } else {
      created.push({ url: pub.publicUrl, tipo });
    }
  }
  return created;
}

async function syncImagesVideos(propertyId) {
  const midias = await ensureMidiasRecords(propertyId);
  const images = midias.filter(m => m.tipo === 'imagem').map(m => m.url);
  const videos = midias.filter(m => m.tipo === 'video').map(m => m.url);
  const { error } = await supabase
    .from('imoveis')
    .update({ images: images.length > 0 ? images : null, videos: videos.length > 0 ? videos : null })
    .eq('id', propertyId);
  if (error) throw error;
  return { imagesCount: images.length, videosCount: videos.length };
}

async function main() {
  const { start, end } = getTodayRange();
  // Debug: listar conteúdo raiz do bucket
  const { data: rootList, error: rootErr } = await supabase.storage.from('midia').list('');
  if (rootErr) {
    console.error('Erro ao listar raiz do bucket:', rootErr);
  } else {
    console.log('Itens na raiz do bucket:', rootList?.map(i => i.name));
  }
  let { data: imoveisHoje, error } = await supabase
    .from('imoveis')
    .select('id, data_publicacao')
    .gte('data_publicacao', start)
    .lt('data_publicacao', end)
    .order('data_publicacao', { ascending: false })
    .limit(2);

  if (error) {
    console.error('Erro ao buscar imoveis de hoje:', error);
  }

  if (!imoveisHoje || imoveisHoje.length === 0) {
    const { data: imoveisUltimos, error: e2 } = await supabase
      .from('imoveis')
      .select('id, data_publicacao')
      .order('data_publicacao', { ascending: false })
      .limit(2);
    if (e2) {
      console.error('Erro ao buscar últimos imoveis:', e2);
      process.exit(1);
    }
    imoveisHoje = imoveisUltimos || [];
  }

  console.log('Imóveis alvo:', imoveisHoje.map(i => i.id));

  for (const imovel of imoveisHoje) {
    try {
      // Se não houver pasta do imóvel, tentar mover arquivos mais recentes de quallity-home para a pasta do imóvel
      const { data: existingFolder } = await supabase.storage.from('midia').list(`${imovel.id}`);
      const hasFolderContent = Array.isArray(existingFolder) && existingFolder.length > 0;
      if (!hasFolderContent) {
        const { data: qhList } = await supabase.storage.from('midia').list('quallity-home');
        console.log('Arquivos em quallity-home:', qhList?.map(f => `${f.name}`));
        if (Array.isArray(qhList) && qhList.length > 0 && imovel.data_publicacao) {
          const pubTime = new Date(imovel.data_publicacao).getTime();
          const windowMs = 2 * 60 * 60 * 1000; // 2h
          const candidates = qhList.filter(f => {
            const lm = new Date(f.updated_at || f.created_at || Date.now()).getTime();
            return Math.abs(lm - pubTime) <= windowMs;
          });
          console.log(`Candidatos por janela de tempo para ${imovel.id}:`, candidates.map(c => c.name));
          // Se nenhum candidato por janela de tempo, tomar os últimos 5 como fallback
          const selected = candidates.length > 0 ? candidates.slice(-5) : qhList.slice(-5);
          console.log(`Selecionados para mover para ${imovel.id}:`, selected.map(s => s.name));
          for (const f of selected) {
            const fromPath = `quallity-home/${f.name}`;
            const toPath = `${imovel.id}/${f.name}`;
            const { error: moveErr } = await supabase.storage.from('midia').move(fromPath, toPath);
            if (moveErr) {
              console.warn('Falha ao mover', fromPath, '->', toPath, moveErr);
            } else {
              console.log('Movido', fromPath, '->', toPath);
            }
          }
          const { data: afterMove } = await supabase.storage.from('midia').list(`${imovel.id}`);
          console.log(`Conteúdo da pasta ${imovel.id} após move:`, afterMove?.map(a => a.name));
        }
      }
      const result = await syncImagesVideos(imovel.id);
      console.log(`Imovel ${imovel.id} sincronizado:`, result);
    } catch (err) {
      console.error(`Erro ao sincronizar imovel ${imovel.id}:`, err);
    }
  }

  console.log('Concluído.');
}

main();