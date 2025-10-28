import puppeteer from 'puppeteer';

async function testButtonColors() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🔍 Testando cores dos botões de seleção...');
        
        // Navegar para a página inicial
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fazer login como admin
    console.log('🔐 Fazendo login como admin...');
    await page.goto('http://localhost:3000/admin/login');
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@qualityhome.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Navegar para o formulário de publicação admin
    console.log('📝 Navegando para o formulário de publicação admin...');
    await page.goto('http://localhost:3000/admin/publish');
    await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Capturar screenshot inicial
        await page.screenshot({ path: 'test_screenshots/button_colors_initial.png', fullPage: true });
        
        // Testar botões de Tipo de Operação
        console.log('🔴 Testando botões de Tipo de Operação...');
        
        // Procurar por botões que contenham "Venda"
        const vendaButtons = await page.$$('button');
        for (let button of vendaButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && text.includes('Venda')) {
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Clicou no botão Venda');
                break;
            }
        }
        
        await page.screenshot({ path: 'test_screenshots/button_venda_selected.png', fullPage: true });
        
        // Procurar por botões que contenham "Aluguel"
        const aluguelButtons = await page.$$('button');
        for (let button of aluguelButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && text.includes('Aluguel')) {
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Clicou no botão Aluguel');
                break;
            }
        }
        
        await page.screenshot({ path: 'test_screenshots/button_aluguel_selected.png', fullPage: true });
        
        // Testar botões de Tipo de Imóvel
        console.log('🏠 Testando botões de Tipo de Imóvel...');
        
        // Procurar por botões que contenham "Casa"
        const casaButtons = await page.$$('button');
        for (let button of casaButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && text.includes('Casa')) {
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Clicou no botão Casa');
                break;
            }
        }
        
        await page.screenshot({ path: 'test_screenshots/button_casa_selected.png', fullPage: true });
        
        // Testar formulário de publicação regular
    console.log('📋 Testando formulário de publicação regular...');
    await page.goto('http://localhost:3000/publish');
    await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Testar botões de operação no formulário regular
        const vendaRegularButtons = await page.$$('button');
        for (let button of vendaRegularButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && text.includes('Venda')) {
                await button.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✅ Clicou no botão Venda (formulário regular)');
                break;
            }
        }
        
        await page.screenshot({ path: 'test_screenshots/button_venda_regular_selected.png', fullPage: true });
        
        console.log('✅ Teste de cores dos botões concluído!');
        console.log('📸 Screenshots salvos em test_screenshots/');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        try {
            await page.screenshot({ path: 'test_screenshots/button_colors_error.png', fullPage: true });
        } catch (screenshotError) {
            console.error('❌ Erro ao capturar screenshot de erro:', screenshotError);
        }
    } finally {
        await browser.close();
    }
}

testButtonColors();