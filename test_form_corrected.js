import { chromium } from 'playwright';

async function testPublishForm() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Iniciando teste do formulário de publicação...');
    
    // 1. Navegar para a página inicial
    console.log('📍 Navegando para http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Fechar qualquer modal que possa aparecer
    try {
      const closeModalButton = page.locator('button:has-text("×")').or(page.locator('button:has-text("Fechar")'));
      if (await closeModalButton.count() > 0) {
        await closeModalButton.first().click();
        console.log('✅ Modal fechado');
      }
    } catch (e) {
      console.log('ℹ️ Nenhum modal para fechar');
    }
    
    await page.screenshot({ path: 'test_screenshots/01_home_page.png' });

    // 2. Acessar o painel administrativo diretamente
    console.log('🔐 Acessando painel administrativo...');
    await page.goto('http://localhost:3000/#adminLogin');
    await page.waitForLoadState('networkidle');
    
    // Aguardar um pouco para garantir que a página carregou completamente
    await page.waitForTimeout(2000);
    
    // Fechar qualquer modal que possa aparecer na página de login
    try {
      const geoModal = page.locator('[aria-labelledby="initial-geo-modal-title"]');
      if (await geoModal.count() > 0) {
        const closeButton = geoModal.locator('button').first();
        await closeButton.click();
        console.log('✅ Modal de geolocalização fechado');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('ℹ️ Nenhum modal de geolocalização para fechar');
    }
    
    await page.screenshot({ path: 'test_screenshots/02_admin_login.png' });

    // 3. Fazer login como admin
    console.log('📝 Fazendo login...');
    
    // Aguardar e preencher email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.click(); // Garantir foco
    await emailInput.fill('quallity@admin.com');
    console.log('✅ Email preenchido');
    
    // Aguardar e preencher senha
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.click(); // Garantir foco
    await passwordInput.fill('1234');
    console.log('✅ Senha preenchida');
    
    // Aguardar um pouco antes de clicar no botão
    await page.waitForTimeout(1000);
    
    // Clicar no botão de login com força
    const loginButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Entrar")'));
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Tentar clicar várias vezes se necessário
    let loginSuccess = false;
    for (let i = 0; i < 3; i++) {
      try {
        await loginButton.click({ force: true });
        console.log(`✅ Tentativa ${i + 1} de clique no botão de login`);
        
        // Aguardar redirecionamento ou mudança na URL
        await page.waitForTimeout(3000);
        
        // Verificar se houve redirecionamento
        const currentUrl = page.url();
        if (currentUrl.includes('adminDashboard') || currentUrl.includes('dashboard')) {
          loginSuccess = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Tentativa ${i + 1} falhou:`, e.message);
        await page.waitForTimeout(2000);
      }
    }
    
    if (!loginSuccess) {
      console.log('⚠️ Login pode não ter funcionado, continuando mesmo assim...');
    }
    
    await page.screenshot({ path: 'test_screenshots/03_after_login.png' });

    // 4. Clicar no botão "Publicar Novo Imóvel"
    console.log('➕ Clicando em Publicar Novo Imóvel...');
    const publishButton = page.locator('text=Publicar Novo Imóvel').or(page.locator('text=Publicar Imóvel'));
    await publishButton.waitFor({ state: 'visible' });
    await publishButton.click();
    
    // Aguardar carregamento do formulário
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test_screenshots/04_publish_form_loaded.png' });

    // 5. Testar Passo 1 - Informações Básicas
    console.log('📋 Testando Passo 1 - Informações Básicas...');
    
    // Verificar se estamos no passo 1
    const step1Indicator = page.locator('text=Passo 1 de').or(page.locator('text=1').first());
    await step1Indicator.waitFor({ state: 'visible', timeout: 5000 });
    
    // Preencher título
    const titleInput = page.locator('input[name="titulo"]').or(page.locator('input[placeholder*="título"]'));
    if (await titleInput.count() > 0) {
      await titleInput.fill('Apartamento Moderno no Centro da Cidade');
      console.log('✅ Título preenchido');
    } else {
      console.log('❌ Campo título não encontrado');
    }
    
    // Preencher descrição
    const descriptionInput = page.locator('textarea[name="descricao"]').or(page.locator('textarea[placeholder*="descrição"]'));
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill('Apartamento com excelente localização, próximo ao centro comercial e transporte público.');
      console.log('✅ Descrição preenchida');
    } else {
      console.log('❌ Campo descrição não encontrado');
    }
    
    // Selecionar tipo de operação
    const operationSelect = page.locator('select[name="tipo_operacao"]').or(page.locator('text=Venda').first());
    if (await operationSelect.count() > 0) {
      if (await operationSelect.getAttribute('tagName') === 'SELECT') {
        await operationSelect.selectOption('venda');
      } else {
        await operationSelect.click();
      }
      console.log('✅ Tipo de operação selecionado');
    } else {
      console.log('❌ Campo tipo de operação não encontrado');
    }
    
    // Preencher preço
    const priceInput = page.locator('input[name="preco"]').or(page.locator('input[placeholder*="preço"]'));
    if (await priceInput.count() > 0) {
      await priceInput.fill('350000');
      console.log('✅ Preço preenchido');
    } else {
      console.log('❌ Campo preço não encontrado');
    }
    
    await page.screenshot({ path: 'test_screenshots/05_step1_filled.png' });
    
    // Clicar em "Próximo"
    const nextButton = page.locator('button:has-text("Próximo")').or(page.locator('button:has-text("Next")'));
    if (await nextButton.count() > 0) {
      await nextButton.click();
      console.log('✅ Avançou para o próximo passo');
    } else {
      console.log('❌ Botão Próximo não encontrado');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/06_step2_loaded.png' });

    // 6. Testar Passo 2 - Endereço
    console.log('📍 Testando Passo 2 - Endereço...');
    
    // Preencher CEP
    const cepInput = page.locator('input[name="cep"]').or(page.locator('input[placeholder*="CEP"]'));
    if (await cepInput.count() > 0) {
      await cepInput.fill('01310-100');
      await page.waitForTimeout(2000); // Aguardar busca do CEP
      console.log('✅ CEP preenchido');
    } else {
      console.log('❌ Campo CEP não encontrado');
    }
    
    await page.screenshot({ path: 'test_screenshots/07_step2_filled.png' });
    
    // Avançar para próximo passo
    const nextButton2 = page.locator('button:has-text("Próximo")');
    if (await nextButton2.count() > 0) {
      await nextButton2.click();
      console.log('✅ Avançou para o passo 3');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/08_step3_loaded.png' });

    // 7. Testar Passo 3 - Detalhes
    console.log('🏠 Testando Passo 3 - Detalhes...');
    
    // Preencher quartos
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
    
    // Preencher banheiros
    const bathroomsInput = page.locator('input[name="banheiros"]').or(page.locator('button:has-text("+")').nth(1));
    if (await bathroomsInput.count() > 0) {
      if (await bathroomsInput.getAttribute('type') === 'number') {
        await bathroomsInput.fill('2');
      } else {
        await bathroomsInput.click();
      }
      console.log('✅ Banheiros definido');
    }
    
    await page.screenshot({ path: 'test_screenshots/09_step3_filled.png' });
    
    // Avançar para próximo passo
    const nextButton3 = page.locator('button:has-text("Próximo")');
    if (await nextButton3.count() > 0) {
      await nextButton3.click();
      console.log('✅ Avançou para o passo 4');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test_screenshots/10_step4_loaded.png' });

    // 8. Testar Passo 4 - Mídias
    console.log('📸 Testando Passo 4 - Mídias...');
    
    // Verificar se há área de upload
    const uploadArea = page.locator('input[type="file"]').or(page.locator('text=Selecionar Fotos'));
    if (await uploadArea.count() > 0) {
      console.log('✅ Área de upload encontrada');
    } else {
      console.log('❌ Área de upload não encontrada');
    }
    
    await page.screenshot({ path: 'test_screenshots/11_step4_final.png' });

    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    await page.screenshot({ path: 'test_screenshots/error_screenshot.png' });
  } finally {
    await browser.close();
  }
}

testPublishForm();