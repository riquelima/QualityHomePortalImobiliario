#!/usr/bin/env python3
"""
Teste simples do formulário multietapas de publicação
"""

import asyncio
from playwright.async_api import async_playwright
import time

async def test_form_steps():
    """Testa cada etapa do formulário multietapas"""
    
    async with async_playwright() as p:
        # Lançar navegador
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Iniciando teste do formulário multietapas...")
            
            # Navegar para a página de publicação
            print("📍 Navegando para http://localhost:3000/#publish")
            await page.goto("http://localhost:3000/#publish")
            await page.wait_for_load_state('networkidle')
            
            # Aguardar a página carregar
            await asyncio.sleep(3)
            
            # Verificar se a página carregou corretamente
            title = await page.title()
            print(f"📄 Título da página: {title}")
            
            # Capturar screenshot inicial
            await page.screenshot(path="test_screenshots/01_initial_page.png")
            print("📸 Screenshot inicial capturada")
            
            # PASSO 1: Informações Básicas
            print("\n📝 Testando Passo 1: Informações Básicas")
            
            # Verificar se estamos no passo 1
            step_indicator = page.locator("text=Passo 1 de 4")
            if await step_indicator.is_visible():
                print("✅ Indicador do Passo 1 encontrado")
            else:
                print("❌ Indicador do Passo 1 não encontrado")
            
            # Preencher título
            titulo_input = page.locator('input[placeholder*="Apartamento"]')
            if await titulo_input.is_visible():
                await titulo_input.fill("Apartamento 3 quartos com vista para o mar")
                print("✅ Título preenchido")
            else:
                print("❌ Campo título não encontrado")
            
            # Preencher descrição
            descricao_textarea = page.locator('textarea[placeholder*="Descreva"]')
            if await descricao_textarea.is_visible():
                await descricao_textarea.fill("Lindo apartamento com 3 quartos, 2 banheiros e vista para o mar.")
                print("✅ Descrição preenchida")
            else:
                print("❌ Campo descrição não encontrado")
            
            # Selecionar tipo de imóvel
            tipo_select = page.locator('select').nth(1)  # Segundo select (tipo de imóvel)
            if await tipo_select.is_visible():
                await tipo_select.select_option("Apartamento")
                print("✅ Tipo de imóvel selecionado")
            else:
                print("❌ Campo tipo de imóvel não encontrado")
            
            # Preencher preço
            preco_input = page.locator('input[type="number"][placeholder="0,00"]')
            if await preco_input.is_visible():
                await preco_input.fill("450000")
                print("✅ Preço preenchido")
            else:
                print("❌ Campo preço não encontrado")
            
            # Capturar screenshot do passo 1
            await page.screenshot(path="test_screenshots/02_step1_filled.png")
            print("📸 Screenshot do Passo 1 preenchido")
            
            # Clicar no botão "Próximo"
            next_button = page.locator('button:has-text("Próximo")')
            if await next_button.is_visible():
                await next_button.click()
                print("✅ Botão 'Próximo' clicado")
                await asyncio.sleep(2)
            else:
                print("❌ Botão 'Próximo' não encontrado")
            
            # PASSO 2: Endereço
            print("\n🏠 Testando Passo 2: Endereço")
            
            # Verificar se estamos no passo 2
            step2_indicator = page.locator("text=Passo 2 de 4")
            if await step2_indicator.is_visible():
                print("✅ Indicador do Passo 2 encontrado")
            else:
                print("❌ Indicador do Passo 2 não encontrado")
            
            # Preencher CEP
            cep_input = page.locator('input[placeholder*="CEP"]')
            if await cep_input.is_visible():
                await cep_input.fill("88010-000")
                print("✅ CEP preenchido")
                await asyncio.sleep(3)  # Aguardar busca do endereço
            else:
                print("❌ Campo CEP não encontrado")
            
            # Capturar screenshot do passo 2
            await page.screenshot(path="test_screenshots/03_step2_filled.png")
            print("📸 Screenshot do Passo 2 preenchido")
            
            # Clicar no botão "Próximo" novamente
            next_button2 = page.locator('button:has-text("Próximo")')
            if await next_button2.is_visible():
                await next_button2.click()
                print("✅ Botão 'Próximo' do Passo 2 clicado")
                await asyncio.sleep(2)
            else:
                print("❌ Botão 'Próximo' do Passo 2 não encontrado")
            
            # PASSO 3: Detalhes
            print("\n🏡 Testando Passo 3: Detalhes")
            
            # Verificar se estamos no passo 3
            step3_indicator = page.locator("text=Passo 3 de 4")
            if await step3_indicator.is_visible():
                print("✅ Indicador do Passo 3 encontrado")
            else:
                print("❌ Indicador do Passo 3 não encontrado")
            
            # Preencher quartos
            quartos_input = page.locator('input[type="number"]').first
            if await quartos_input.is_visible():
                await quartos_input.fill("3")
                print("✅ Número de quartos preenchido")
            else:
                print("❌ Campo quartos não encontrado")
            
            # Preencher banheiros
            banheiros_input = page.locator('input[type="number"]').nth(1)
            if await banheiros_input.is_visible():
                await banheiros_input.fill("2")
                print("✅ Número de banheiros preenchido")
            else:
                print("❌ Campo banheiros não encontrado")
            
            # Marcar algumas características
            checkboxes = page.locator('input[type="checkbox"]')
            checkbox_count = await checkboxes.count()
            if checkbox_count > 0:
                await checkboxes.nth(0).click()
                if checkbox_count > 1:
                    await checkboxes.nth(1).click()
                print(f"✅ {min(2, checkbox_count)} características marcadas")
            else:
                print("❌ Checkboxes de características não encontrados")
            
            # Capturar screenshot do passo 3
            await page.screenshot(path="test_screenshots/04_step3_filled.png")
            print("📸 Screenshot do Passo 3 preenchido")
            
            # Clicar no botão "Próximo" para o passo 4
            next_button3 = page.locator('button:has-text("Próximo")')
            if await next_button3.is_visible():
                await next_button3.click()
                print("✅ Botão 'Próximo' do Passo 3 clicado")
                await asyncio.sleep(2)
            else:
                print("❌ Botão 'Próximo' do Passo 3 não encontrado")
            
            # PASSO 4: Mídias
            print("\n📸 Testando Passo 4: Mídias")
            
            # Verificar se estamos no passo 4
            step4_indicator = page.locator("text=Passo 4 de 4")
            if await step4_indicator.is_visible():
                print("✅ Indicador do Passo 4 encontrado")
            else:
                print("❌ Indicador do Passo 4 não encontrado")
            
            # Verificar se o botão de upload está presente
            upload_button = page.locator('label[for="image-upload"]')
            if await upload_button.is_visible():
                print("✅ Botão de upload de imagens encontrado")
            else:
                print("❌ Botão de upload de imagens não encontrado")
            
            # Capturar screenshot final
            await page.screenshot(path="test_screenshots/05_step4_final.png")
            print("📸 Screenshot final capturada")
            
            print("\n🎯 Teste concluído!")
            print("📁 Screenshots salvos na pasta test_screenshots/")
            
        except Exception as e:
            print(f"❌ Erro durante o teste: {str(e)}")
            await page.screenshot(path="test_screenshots/error.png")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    # Criar pasta para screenshots
    import os
    os.makedirs("test_screenshots", exist_ok=True)
    
    # Executar teste
    asyncio.run(test_form_steps())