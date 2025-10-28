import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testFormSteps() {
    console.log('🚀 Iniciando teste do formulário multietapas...');
    
    // Criar pasta para screenshots
    const screenshotDir = 'test_screenshots';
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navegar para a página de publicação
        console.log('📍 Navegando para http://localhost:3000/#publish');
        await page.goto('http://localhost:3000/#publish');
        await page.waitForLoadState('networkidle');
        
        // Aguardar a página carregar
        await page.waitForTimeout(3000);
        
        // Verificar se a página carregou corretamente
        const title = await page.title();
        console.log(`📄 Título da página: ${title}`);
        
        // Capturar screenshot inicial
        await page.screenshot({ path: 'test_screenshots/01_initial_page.png' });
        console.log('📸 Screenshot inicial capturada');
        
        // PASSO 1: Informações Básicas
        console.log('\n📝 Testando Passo 1: Informações Básicas');
        
        // Verificar se estamos no passo 1
        const step1Indicator = page.locator('text=Passo 1 de 4');
        if (await step1Indicator.isVisible()) {
            console.log('✅ Indicador do Passo 1 encontrado');
        } else {
            console.log('❌ Indicador do Passo 1 não encontrado');
        }
        
        // Preencher título
        const tituloInput = page.locator('input[placeholder*="Apartamento"]');
        if (await tituloInput.isVisible()) {
            await tituloInput.fill('Apartamento 3 quartos com vista para o mar');
            console.log('✅ Título preenchido');
        } else {
            console.log('❌ Campo título não encontrado');
        }
        
        // Preencher descrição
        const descricaoTextarea = page.locator('textarea[placeholder*="Descreva"]');
        if (await descricaoTextarea.isVisible()) {
            await descricaoTextarea.fill('Lindo apartamento com 3 quartos, 2 banheiros e vista para o mar.');
            console.log('✅ Descrição preenchida');
        } else {
            console.log('❌ Campo descrição não encontrado');
        }
        
        // Selecionar tipo de imóvel
        const tipoSelect = page.locator('select').nth(1); // Segundo select (tipo de imóvel)
        if (await tipoSelect.isVisible()) {
            await tipoSelect.selectOption('Apartamento');
            console.log('✅ Tipo de imóvel selecionado');
        } else {
            console.log('❌ Campo tipo de imóvel não encontrado');
        }
        
        // Preencher preço
        const precoInput = page.locator('input[type="number"][placeholder="0,00"]');
        if (await precoInput.isVisible()) {
            await precoInput.fill('450000');
            console.log('✅ Preço preenchido');
        } else {
            console.log('❌ Campo preço não encontrado');
        }
        
        // Capturar screenshot do passo 1
        await page.screenshot({ path: 'test_screenshots/02_step1_filled.png' });
        console.log('📸 Screenshot do Passo 1 preenchido');
        
        // Clicar no botão "Próximo"
        const nextButton = page.locator('button:has-text("Próximo")');
        if (await nextButton.isVisible()) {
            await nextButton.click();
            console.log('✅ Botão "Próximo" clicado');
            await page.waitForTimeout(2000);
        } else {
            console.log('❌ Botão "Próximo" não encontrado');
        }
        
        // PASSO 2: Endereço
        console.log('\n🏠 Testando Passo 2: Endereço');
        
        // Verificar se estamos no passo 2
        const step2Indicator = page.locator('text=Passo 2 de 4');
        if (await step2Indicator.isVisible()) {
            console.log('✅ Indicador do Passo 2 encontrado');
        } else {
            console.log('❌ Indicador do Passo 2 não encontrado');
        }
        
        // Preencher CEP
        const cepInput = page.locator('input[placeholder*="CEP"]');
        if (await cepInput.isVisible()) {
            await cepInput.fill('88010-000');
            console.log('✅ CEP preenchido');
            await page.waitForTimeout(3000); // Aguardar busca do endereço
        } else {
            console.log('❌ Campo CEP não encontrado');
        }
        
        // Capturar screenshot do passo 2
        await page.screenshot({ path: 'test_screenshots/03_step2_filled.png' });
        console.log('📸 Screenshot do Passo 2 preenchido');
        
        // Clicar no botão "Próximo" novamente
        const nextButton2 = page.locator('button:has-text("Próximo")');
        if (await nextButton2.isVisible()) {
            await nextButton2.click();
            console.log('✅ Botão "Próximo" do Passo 2 clicado');
            await page.waitForTimeout(2000);
        } else {
            console.log('❌ Botão "Próximo" do Passo 2 não encontrado');
        }
        
        // PASSO 3: Detalhes
        console.log('\n🏡 Testando Passo 3: Detalhes');
        
        // Verificar se estamos no passo 3
        const step3Indicator = page.locator('text=Passo 3 de 4');
        if (await step3Indicator.isVisible()) {
            console.log('✅ Indicador do Passo 3 encontrado');
        } else {
            console.log('❌ Indicador do Passo 3 não encontrado');
        }
        
        // Preencher quartos
        const quartosInput = page.locator('input[type="number"]').first();
        if (await quartosInput.isVisible()) {
            await quartosInput.fill('3');
            console.log('✅ Número de quartos preenchido');
        } else {
            console.log('❌ Campo quartos não encontrado');
        }
        
        // Preencher banheiros
        const banheirosInput = page.locator('input[type="number"]').nth(1);
        if (await banheirosInput.isVisible()) {
            await banheirosInput.fill('2');
            console.log('✅ Número de banheiros preenchido');
        } else {
            console.log('❌ Campo banheiros não encontrado');
        }
        
        // Marcar algumas características
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        if (checkboxCount > 0) {
            await checkboxes.nth(0).click();
            if (checkboxCount > 1) {
                await checkboxes.nth(1).click();
            }
            console.log(`✅ ${Math.min(2, checkboxCount)} características marcadas`);
        } else {
            console.log('❌ Checkboxes de características não encontrados');
        }
        
        // Capturar screenshot do passo 3
        await page.screenshot({ path: 'test_screenshots/04_step3_filled.png' });
        console.log('📸 Screenshot do Passo 3 preenchido');
        
        // Clicar no botão "Próximo" para o passo 4
        const nextButton3 = page.locator('button:has-text("Próximo")');
        if (await nextButton3.isVisible()) {
            await nextButton3.click();
            console.log('✅ Botão "Próximo" do Passo 3 clicado');
            await page.waitForTimeout(2000);
        } else {
            console.log('❌ Botão "Próximo" do Passo 3 não encontrado');
        }
        
        // PASSO 4: Mídias
        console.log('\n📸 Testando Passo 4: Mídias');
        
        // Verificar se estamos no passo 4
        const step4Indicator = page.locator('text=Passo 4 de 4');
        if (await step4Indicator.isVisible()) {
            console.log('✅ Indicador do Passo 4 encontrado');
        } else {
            console.log('❌ Indicador do Passo 4 não encontrado');
        }
        
        // Verificar se o botão de upload está presente
        const uploadButton = page.locator('label[for="image-upload"]');
        if (await uploadButton.isVisible()) {
            console.log('✅ Botão de upload de imagens encontrado');
        } else {
            console.log('❌ Botão de upload de imagens não encontrado');
        }
        
        // Capturar screenshot final
        await page.screenshot({ path: 'test_screenshots/05_step4_final.png' });
        console.log('📸 Screenshot final capturada');
        
        console.log('\n🎯 Teste concluído!');
        console.log('📁 Screenshots salvos na pasta test_screenshots/');
        
    } catch (error) {
        console.log(`❌ Erro durante o teste: ${error.message}`);
        await page.screenshot({ path: 'test_screenshots/error.png' });
    } finally {
        await browser.close();
    }
}

// Executar teste
testFormSteps().catch(console.error);