// Script de teste manual para o formulário multietapas
// Execute este script no console do navegador na página de publicação

console.log('🔍 Iniciando teste manual do formulário multietapas...');

// Função para aguardar um elemento aparecer
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para preencher um campo
function fillField(selector, value, type = 'input') {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`❌ Campo não encontrado: ${selector}`);
    return false;
  }

  if (type === 'select') {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (type === 'textarea') {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  console.log(`✅ Campo preenchido: ${selector} = ${value}`);
  return true;
}

// Função para clicar em um botão
function clickButton(selector) {
  const button = document.querySelector(selector);
  if (!button) {
    console.error(`❌ Botão não encontrado: ${selector}`);
    return false;
  }
  
  button.click();
  console.log(`✅ Botão clicado: ${selector}`);
  return true;
}

// Teste do Passo 1: Informações Básicas
async function testStep1() {
  console.log('\n📝 Testando Passo 1: Informações Básicas');
  
  try {
    // Aguardar o formulário carregar
    await waitForElement('input[placeholder*="Apartamento"]');
    
    // Preencher campos básicos
    fillField('input[placeholder*="Apartamento"]', 'Apartamento 3 quartos com vista para o mar');
    fillField('textarea[placeholder*="Descreva"]', 'Lindo apartamento com 3 quartos, 2 banheiros, sala ampla e vista deslumbrante para o mar. Localizado em área nobre da cidade.');
    fillField('select[value="venda"]', 'venda', 'select');
    fillField('select:has(option[value="Apartamento"])', 'Apartamento', 'select');
    fillField('input[type="number"][placeholder="0,00"]', '450000');
    
    console.log('✅ Passo 1 preenchido com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no Passo 1:', error.message);
    return false;
  }
}

// Teste do Passo 2: Endereço
async function testStep2() {
  console.log('\n🏠 Testando Passo 2: Endereço');
  
  try {
    // Clicar no botão "Próximo" para ir para o passo 2
    if (!clickButton('button:contains("Próximo")')) {
      // Tentar seletor alternativo
      clickButton('button[type="button"]:not([disabled])');
    }
    
    // Aguardar o campo de CEP aparecer
    await waitForElement('input[placeholder*="CEP"]', 3000);
    
    // Preencher CEP (exemplo de Florianópolis)
    fillField('input[placeholder*="CEP"]', '88010-000');
    
    // Aguardar um pouco para o endereço carregar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Passo 2 preenchido com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no Passo 2:', error.message);
    return false;
  }
}

// Teste do Passo 3: Detalhes
async function testStep3() {
  console.log('\n🏡 Testando Passo 3: Detalhes');
  
  try {
    // Clicar no botão "Próximo" para ir para o passo 3
    clickButton('button:contains("Próximo")');
    
    // Aguardar os campos de detalhes aparecerem
    await waitForElement('input[type="number"]', 3000);
    
    // Preencher detalhes do imóvel
    const numberInputs = document.querySelectorAll('input[type="number"]');
    if (numberInputs[0]) numberInputs[0].value = '3'; // quartos
    if (numberInputs[1]) numberInputs[1].value = '2'; // banheiros
    if (numberInputs[2]) numberInputs[2].value = '120'; // área bruta
    if (numberInputs[3]) numberInputs[3].value = '100'; // área útil
    
    // Disparar eventos de mudança
    numberInputs.forEach(input => {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Marcar algumas características
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (checkboxes[0]) checkboxes[0].click(); // primeira característica
    if (checkboxes[1]) checkboxes[1].click(); // segunda característica
    
    console.log('✅ Passo 3 preenchido com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no Passo 3:', error.message);
    return false;
  }
}

// Teste do Passo 4: Mídias
async function testStep4() {
  console.log('\n📸 Testando Passo 4: Mídias');
  
  try {
    // Clicar no botão "Próximo" para ir para o passo 4
    clickButton('button:contains("Próximo")');
    
    // Aguardar a seção de upload aparecer
    await waitForElement('input[type="file"]', 3000);
    
    console.log('✅ Passo 4 carregado com sucesso');
    console.log('ℹ️  Upload de arquivos requer interação manual');
    return true;
  } catch (error) {
    console.error('❌ Erro no Passo 4:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando teste completo do formulário multietapas...\n');
  
  const results = {
    step1: await testStep1(),
    step2: await testStep2(),
    step3: await testStep3(),
    step4: await testStep4()
  };
  
  console.log('\n📊 Resultados dos testes:');
  console.log('Passo 1 (Informações Básicas):', results.step1 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Passo 2 (Endereço):', results.step2 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Passo 3 (Detalhes):', results.step3 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Passo 4 (Mídias):', results.step4 ? '✅ PASSOU' : '❌ FALHOU');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Resumo: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! O formulário está funcionando corretamente.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.');
  }
  
  return results;
}

// Executar os testes
runAllTests();