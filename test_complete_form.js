import { chromium } from 'playwright';

async function testCompleteAdminForm() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando teste completo do formulário administrativo...');
    
    // 1. Navegar para o login administrativo
    console.log('🔐 Acessando login administrativo...');
    await page.goto('http://localhost:3000/#adminLogin');
    await page.waitForLoadState('networkidle');
    
    // Fechar modal de geolocalização se aparecer
    try {
      await page.waitForTimeout(2000);
      const geoModal = page.locator('[aria-labelledby="initial-geo-modal-title"]');
      if (await geoModal.count() > 0) {
        const closeButton = geoModal.locator('button').first();
        await closeButton.click();
        console.log('✅ Modal de geolocalização fechado');
      }
    } catch (e) {
      console.log('ℹ️ Nenhum modal de geolocalização');
    }
    
    await page.screenshot({ path: 'test_screenshots/complete_01_login.png' });

    // 2. Fazer login
    console.log('📝 Fazendo login...');
    await page.fill('input[type="email"]', 'quallity@admin.com');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test_screenshots/complete_02_dashboard.png' });

    // 3. Acessar formulário de novo anúncio
    console.log('📋 Acessando formulário de novo anúncio...');
    const newAdButton = page.locator('text=Novo Anúncio');
    await newAdButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test_screenshots/complete_03_form_loaded.png' });

    // 4. Preencher informações principais
    console.log('📝 Preenchendo informações principais...');
    
    // Selecionar Venda
    await page.locator('button:has-text("Venda")').first().click();
    await page.waitForTimeout(1000);
    
    // Selecionar Apartamento
    await page.locator('button:has-text("Apartamento")').first().click();
    await page.waitForTimeout(1000);
    
    // Preencher título
    await page.locator('input[placeholder*="Apartamento 2 quartos"]').fill('Apartamento Moderno 3 Quartos - Centro');
    await page.waitForTimeout(500);
    
    // Preencher descrição
    await page.locator('textarea[placeholder*="Descreva as principais características"]').fill('Apartamento com excelente localização no centro da cidade, com acabamento moderno, 3 quartos sendo 1 suíte, sala ampla, cozinha equipada e 2 vagas de garagem.');
    await page.waitForTimeout(500);
    
    // Preencher preço
    await page.locator('input[placeholder="R$ 0,00"]').first().fill('450000');
    await page.waitForTimeout(500);
    
    // Preencher área bruta
    await page.locator('input[placeholder="0"]').first().fill('120');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test_screenshots/complete_04_main_info_filled.png' });

    // 5. Preencher endereço
    console.log('📍 Preenchendo endereço...');
    
    // Preencher CEP
    const cepInput = page.locator('input[placeholder*="CEP"]').or(page.locator('input[maxlength="9"]'));
    if (await cepInput.count() > 0) {
      await cepInput.fill('01310-100');
      await page.waitForTimeout(3000); // Aguardar busca automática do CEP
      console.log('✅ CEP preenchido');
    }
    
    // Preencher número
    try {
      const numberInput = page.locator('input[placeholder*="número"]').or(page.locator('input[placeholder*="Número"]'));
      if (await numberInput.count() > 0) {
        await numberInput.fill('123');
        console.log('✅ Número preenchido');
      }
    } catch (e) {
      console.log('ℹ️ Campo número não encontrado');
    }
    
    await page.screenshot({ path: 'test_screenshots/complete_05_address_filled.png' });

    // 6. Preencher características do imóvel
    console.log('🏠 Preenchendo características...');
    
    // Definir quartos (usando botões + e -)
    try {
      const quartosSection = page.locator('text=Quartos').locator('..').locator('..');
      const plusButton = quartosSection.locator('button:has-text("+")');
      if (await plusButton.count() > 0) {
        await plusButton.click();
        await plusButton.click();
        await plusButton.click(); // 3 quartos
        console.log('✅ Quartos definidos (3)');
      }
    } catch (e) {
      console.log('ℹ️ Não foi possível definir quartos:', e.message);
    }
    
    // Definir banheiros
    try {
      const banheirosSection = page.locator('text=Banheiros').locator('..').locator('..');
      const plusButton = banheirosSection.locator('button:has-text("+")');
      if (await plusButton.count() > 0) {
        await plusButton.click();
        await plusButton.click(); // 2 banheiros
        console.log('✅ Banheiros definidos (2)');
      }
    } catch (e) {
      console.log('ℹ️ Não foi possível definir banheiros:', e.message);
    }
    
    // Definir vagas de garagem
    try {
      const vagasSection = page.locator('text=Vagas').locator('..').locator('..');
      const plusButton = vagasSection.locator('button:has-text("+")');
      if (await plusButton.count() > 0) {
        await plusButton.click();
        await plusButton.click(); // 2 vagas
        console.log('✅ Vagas definidas (2)');
      }
    } catch (e) {
      console.log('ℹ️ Não foi possível definir vagas:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/complete_06_characteristics_filled.png' });

    // 7. Selecionar características do imóvel
    console.log('✨ Selecionando características...');
    
    try {
      // Selecionar algumas características comuns
      const characteristics = [
        'Ar condicionado',
        'Varanda',
        'Garagem',
        'Suíte'
      ];
      
      for (const char of characteristics) {
        try {
          const charButton = page.locator(`button:has-text("${char}")`);
          if (await charButton.count() > 0) {
            await charButton.first().click();
            await page.waitForTimeout(500);
            console.log(`✅ Característica selecionada: ${char}`);
          }
        } catch (e) {
          console.log(`ℹ️ Característica não encontrada: ${char}`);
        }
      }
    } catch (e) {
      console.log('ℹ️ Erro ao selecionar características:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/complete_07_features_selected.png' });

    // 8. Verificar seção de upload
    console.log('📸 Verificando seção de upload...');
    
    try {
      const uploadSection = page.locator('text=Fotos').or(page.locator('text=Upload'));
      if (await uploadSection.count() > 0) {
        console.log('✅ Seção de upload encontrada');
      }
      
      // Verificar se há área de drag and drop
      const dropArea = page.locator('text=Arraste e solte').or(page.locator('input[type="file"]'));
      if (await dropArea.count() > 0) {
        console.log('✅ Área de upload de arquivos encontrada');
      }
    } catch (e) {
      console.log('ℹ️ Erro ao verificar upload:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/complete_08_upload_section.png' });

    // 9. Tentar submeter o formulário
    console.log('📤 Tentando submeter o formulário...');
    
    try {
      // Procurar botão de submissão
      const submitButtons = [
        'button:has-text("Publicar")',
        'button:has-text("Salvar")',
        'button:has-text("Enviar")',
        'button[type="submit"]'
      ];
      
      let submitted = false;
      for (const selector of submitButtons) {
        try {
          const button = page.locator(selector);
          if (await button.count() > 0) {
            await button.first().click();
            console.log(`✅ Botão de submissão clicado: ${selector}`);
            submitted = true;
            break;
          }
        } catch (e) {
          console.log(`ℹ️ Botão não funcionou: ${selector}`);
        }
      }
      
      if (submitted) {
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test_screenshots/complete_09_after_submit.png' });
        
        // Verificar se houve redirecionamento ou mensagem de sucesso
        const successIndicators = [
          'text=sucesso',
          'text=publicado',
          'text=salvo',
          'text=criado'
        ];
        
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).count() > 0) {
            console.log('✅ Indicador de sucesso encontrado!');
            break;
          }
        }
      } else {
        console.log('⚠️ Nenhum botão de submissão encontrado');
      }
    } catch (e) {
      console.log('❌ Erro ao submeter formulário:', e.message);
      await page.screenshot({ path: 'test_screenshots/complete_error_submit.png' });
    }

    // 10. Verificar estado final
    console.log('🔍 Verificando estado final...');
    await page.screenshot({ path: 'test_screenshots/complete_10_final_state.png' });
    
    console.log('✅ Teste completo do formulário administrativo finalizado!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste completo:', error);
    await page.screenshot({ path: 'test_screenshots/complete_error.png' });
  } finally {
    await browser.close();
  }
}

testCompleteAdminForm();