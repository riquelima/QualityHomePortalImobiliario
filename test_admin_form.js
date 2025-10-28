import { chromium } from 'playwright';

async function testAdminPublishForm() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando teste específico do formulário administrativo...');
    
    // 1. Navegar diretamente para o login administrativo
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
    
    await page.screenshot({ path: 'test_screenshots/admin_01_login_page.png' });

    // 2. Fazer login
    console.log('📝 Fazendo login...');
    
    // Preencher email
    await page.fill('input[type="email"]', 'quallity@admin.com');
    console.log('✅ Email preenchido');
    
    // Preencher senha
    await page.fill('input[type="password"]', '1234');
    console.log('✅ Senha preenchida');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    console.log('✅ Botão de login clicado');
    
    // Aguardar redirecionamento
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test_screenshots/admin_02_after_login.png' });

    // 3. Verificar se estamos no dashboard e clicar em "Novo Anúncio"
    console.log('📋 Procurando botão Novo Anúncio...');
    
    // Tentar diferentes seletores para o botão de novo anúncio
    const newAdSelectors = [
      'text=Novo Anúncio',
      'text=Publicar Novo Imóvel',
      'text=Publicar Imóvel',
      'button:has-text("Novo")',
      'button:has-text("Publicar")',
      '[data-testid="new-property-button"]'
    ];
    
    let buttonFound = false;
    for (const selector of newAdSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.count() > 0) {
          await button.first().click();
          console.log(`✅ Botão encontrado e clicado: ${selector}`);
          buttonFound = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Seletor não funcionou: ${selector}`);
      }
    }
    
    if (!buttonFound) {
      console.log('⚠️ Botão não encontrado, tentando navegar diretamente...');
      // Se não encontrar o botão, tentar navegar diretamente
      await page.goto('http://localhost:3000/#adminDashboard');
      await page.waitForTimeout(2000);
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test_screenshots/admin_03_form_loaded.png' });

    // 4. Testar preenchimento do formulário
    console.log('📝 Testando preenchimento do formulário...');
    
    // Aguardar o formulário carregar
    await page.waitForTimeout(3000);
    
    // Selecionar tipo de operação (Venda) - usando seletor mais específico
    try {
      const vendaButton = page.locator('button:has-text("Venda")').first();
      await vendaButton.waitFor({ timeout: 5000 });
      await vendaButton.click();
      console.log('✅ Tipo de operação "Venda" selecionado');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('❌ Não foi possível selecionar tipo de operação:', e.message);
    }
    
    // Selecionar tipo de imóvel (Apartamento)
    try {
      const apartamentoButton = page.locator('button:has-text("Apartamento")').first();
      await apartamentoButton.waitFor({ timeout: 5000 });
      await apartamentoButton.click();
      console.log('✅ Tipo de imóvel "Apartamento" selecionado');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('❌ Não foi possível selecionar tipo de imóvel:', e.message);
    }
    
    // Preencher título - usando placeholder específico
    try {
      const titleInput = page.locator('input[placeholder*="Apartamento 2 quartos"]');
      await titleInput.waitFor({ timeout: 5000 });
      await titleInput.fill('Apartamento Moderno no Centro');
      console.log('✅ Título preenchido');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('❌ Erro ao preencher título:', e.message);
    }
    
    // Preencher descrição - usando placeholder específico
    try {
      const descriptionInput = page.locator('textarea[placeholder*="Descreva as principais características"]');
      await descriptionInput.waitFor({ timeout: 5000 });
      await descriptionInput.fill('Apartamento com excelente localização e acabamento moderno.');
      console.log('✅ Descrição preenchida');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('❌ Erro ao preencher descrição:', e.message);
    }
    
    // Preencher preço de venda - usando placeholder específico
    try {
      const priceInput = page.locator('input[placeholder="R$ 0,00"]').first();
      await priceInput.waitFor({ timeout: 5000 });
      await priceInput.fill('350000');
      console.log('✅ Preço de venda preenchido');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('❌ Erro ao preencher preço:', e.message);
    }
    
    // Preencher área bruta
    try {
      const areaInput = page.locator('input[placeholder="0"]').first();
      await areaInput.waitFor({ timeout: 5000 });
      await areaInput.fill('85');
      console.log('✅ Área bruta preenchida');
      await page.waitForTimeout(500);
    } catch (e) {
      console.log('❌ Erro ao preencher área:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/admin_04_form_filled.png' });
    
    // 5. Testar seção de endereço
    console.log('📍 Testando seção de endereço...');
    
    try {
      const cepInput = page.locator('input[name="cep"]').or(page.locator('input[placeholder*="CEP"]'));
      if (await cepInput.count() > 0) {
        await cepInput.fill('01310-100');
        console.log('✅ CEP preenchido');
        await page.waitForTimeout(2000); // Aguardar busca automática
      } else {
        console.log('❌ Campo CEP não encontrado');
      }
    } catch (e) {
      console.log('❌ Erro ao preencher CEP:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/admin_05_address_filled.png' });
    
    // 6. Testar características do imóvel
    console.log('🏠 Testando características do imóvel...');
    
    // Selecionar tipo de imóvel
    try {
      const propertyTypeSelect = page.locator('select').first();
      if (await propertyTypeSelect.count() > 0) {
        await propertyTypeSelect.selectOption('Apartamento');
        console.log('✅ Tipo de imóvel selecionado');
      }
    } catch (e) {
      console.log('❌ Erro ao selecionar tipo de imóvel:', e.message);
    }
    
    // Preencher quartos
    try {
      const bedroomsInput = page.locator('input[name="quartos"]').or(page.locator('button:has-text("+")').first());
      if (await bedroomsInput.count() > 0) {
        if (await bedroomsInput.getAttribute('type') === 'number') {
          await bedroomsInput.fill('3');
        } else {
          await bedroomsInput.click();
          await bedroomsInput.click();
        }
        console.log('✅ Quartos definido');
      }
    } catch (e) {
      console.log('❌ Erro ao definir quartos:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/admin_06_characteristics_filled.png' });
    
    // 7. Verificar seção de upload
    console.log('📸 Verificando seção de upload...');
    
    try {
      const uploadArea = page.locator('input[type="file"]').or(page.locator('text=Arraste e solte'));
      if (await uploadArea.count() > 0) {
        console.log('✅ Área de upload encontrada');
      } else {
        console.log('❌ Área de upload não encontrada');
      }
    } catch (e) {
      console.log('❌ Erro ao verificar upload:', e.message);
    }
    
    await page.screenshot({ path: 'test_screenshots/admin_07_final_form.png' });
    
    console.log('✅ Teste do formulário administrativo concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    await page.screenshot({ path: 'test_screenshots/admin_error.png' });
  } finally {
    await browser.close();
  }
}

testAdminPublishForm();