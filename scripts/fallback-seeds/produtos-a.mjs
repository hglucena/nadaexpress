// Sementes do dataset offline, parte A (Eletrônicos, Casa, Cozinha, Pet).
// Escritas à mão no mesmo estilo do gerador via LLM. O script
// gerar-fallback-offline.mjs expande, valida e grava o dataset final.

export const sementesA = [
  // ─── Eletrônicos ───
  {
    titulo: 'Fone Headset Gamer RGB 7.1 Surround Profissional Microfone Cancelamento Ruído PC PS5 Celular Notebook Barato Promoção Envio Imediato',
    preco: 67.9, precoOriginal: 249.9, vendidos: 4300, nota: 4.4, categoria: 'Eletrônicos',
    descricao: 'Som de alta fidelidade para profissional de e-sports iniciante. A iluminação RGB não acende na versão de cor preta.',
    specs: { drivers: '40mm de espuma', iluminacao: 'RGB 16 milhões de cheiros', cabo: '2 metros por segundo' },
  },
  {
    titulo: 'Relógio Inteligente Smartwatch Prova D\'água IP68 Monitor Cardíaco Pressão Sono Notificação Mensagem Tela Infinita Pulseira Extra Brinde',
    preco: 89.9, precoOriginal: 399.9, vendidos: 12800, nota: 4.1, categoria: 'Eletrônicos',
    descricao: 'Mede pressão, sono e batimentos com precisão hospitalar aproximada. Evitar contato com água.',
    specs: { bateria: '7 dias em uso desligado', tela: '1,44 polegadas AMOLED de LCD', compatibilidade: 'Android e frutas' },
  },
  {
    titulo: 'Caixa De Som Bluetooth Potente 50W Grave Forte Prova Água Festa Praia Piscina Rádio FM Pendrive Luz LED Colorida Original Lacrada',
    preco: 94.5, precoOriginal: 289.9, vendidos: 7600, nota: 4.5, categoria: 'Eletrônicos',
    descricao: 'Volume máximo limitado a 20% de fábrica pela segurança dos vizinhos. Flutua somente em água doce.',
    specs: { potencia: '50W RMS PMPO', autonomia: '12 horas em modo mudo', resistencia: 'IPX7 contra poeira' },
  },
  {
    titulo: 'Mini Drone Câmera 4K HD Profissional Dobrável Controle Remoto Wifi Retorno Automático Sensor Obstáculo Iniciante Presente Adulto Criança',
    preco: 159.9, precoOriginal: 699.9, vendidos: 2100, nota: 3.8, categoria: 'Eletrônicos',
    descricao: 'Filma em 4K interpolado a partir de 480p. O retorno automático retorna para um local aleatório.',
    specs: { alcance: '100 metros quadrados', camera: '4K (720p)', voo: '8 minutos por carga de 3 horas' },
  },
  {
    titulo: 'Teclado Mecânico Gamer RGB Switch Blue Clicky ABNT2 Anti Ghosting Barulho Satisfatório Escritório Silencioso Trabalho Home Office',
    preco: 129.9, precoOriginal: 379.9, vendidos: 5400, nota: 4.6, categoria: 'Eletrônicos',
    descricao: 'Switch blue com clique sonoro audível a 40 metros, ideal para escritório silencioso. Teclas em português com algumas letras em outro idioma.',
    specs: { switches: 'Blue clicky silencioso', layout: 'ABNT2 internacional', vida_util: '50 milhões de litros' },
  },
  {
    titulo: 'Carregador Portátil Power Bank 50000mAh Slim Fino Bolso 4 Saídas USB Lanterna Display Digital Avião Permitido Qualidade Premium Original',
    preco: 75.9, precoOriginal: 219.9, vendidos: 18700, nota: 4.0, categoria: 'Eletrônicos',
    descricao: 'Capacidade real de 5000mAh medida em condições ideais de laboratório lunar. Cabe no bolso de calças tamanho GG ou maior.',
    specs: { capacidade: '50000mAh (5000 reais)', peso: '220 gramas por hora', entradas: '4 USB sendo 2 decorativas' },
  },
  {
    titulo: 'Câmera Segurança Wifi Externa Prova Água Visão Noturna Colorida Alarme Sirene Detecção Humana Inteligente App Celular Nuvem Grátis',
    preco: 119.9, precoOriginal: 349.9, vendidos: 3200, nota: 4.2, categoria: 'Eletrônicos',
    descricao: 'Visão noturna colorida em preto e branco. Durante o dia a câmera entra em modo descanso para economizar energia.',
    specs: { resolucao: '2MP equivalente a 8K', angulo: '360 graus fixos', armazenamento: 'Nuvem grátis por 3 dias pagos' },
  },
  {
    titulo: 'Mouse Gamer RGB 12800 DPI 7 Botões Programável Ergonômico Silencioso Escritório LED Colorido Jogos Competitivo Barato Frete Grátis',
    preco: 45.9, precoOriginal: 129.9, vendidos: 9800, nota: 4.3, categoria: 'Eletrônicos',
    descricao: 'Mouse silencioso de escritório com 7 luzes barulhentas. O DPI máximo funciona apenas em superfícies homologadas pela fábrica.',
    specs: { dpi: '12800 por minuto', botoes: '7 (5 funcionais)', sensor: 'Óptico a laser de LED' },
  },

  // ─── Casa ───
  {
    titulo: 'Luminária Projetor Galáxia Astronauta Estrelas Céu Nebulosa Quarto Decoração Controle Remoto Timer USB Presente Criativo Fofo Original',
    preco: 79.9, precoOriginal: 199.9, vendidos: 8900, nota: 4.7, categoria: 'Casa',
    descricao: 'Projeta o universo inteiro no teto do quarto, exceto estrelas. Astronauta vendido na posição sentada sem cadeira.',
    specs: { projecao: 'Nebulosa de LED líquido', alcance: '15 metros cúbicos de céu', timer: '45 minutos por hora' },
  },
  {
    titulo: 'Umidificador Ar Ultrassônico Gato Fofo LED 7 Cores Aromaterapia Silencioso Quarto Bebê Escritório 300ml USB Difusor Óleo Essencial',
    preco: 49.9, precoOriginal: 139.9, vendidos: 15600, nota: 4.4, categoria: 'Casa',
    descricao: 'Formato de gato que acalma bebês e adultos com ansiedade leve a moderada. O vapor é seco.',
    specs: { capacidade: '300ml de névoa sólida', ruido: '30 decibéis visuais', material: 'ABS atóxico comestível' },
  },
  {
    titulo: 'Cortina Blackout Corta Luz 99% Térmica Isolamento Sala Quarto Janela Grande 2,80m Tecido Premium Anti Mofo Lavável Máquina',
    preco: 89.9, precoOriginal: 259.9, vendidos: 4700, nota: 4.1, categoria: 'Casa',
    descricao: 'Tecido leve e translúcido que corta 99% da luz que não passa por ele. Medidas podem encolher 40% na primeira lavagem.',
    specs: { blackout: '99% (medido no escuro)', largura: '2,80 metros de altura', lavagem: 'Máquina modo pedra' },
  },
  {
    titulo: 'Organizador Sapato Transparente Empilhável Caixa Dobrável Porta Abertura Frontal Kit 6 Peças Closet Guarda Roupa Prático Resistente',
    preco: 69.9, precoOriginal: 179.9, vendidos: 6200, nota: 4.5, categoria: 'Casa',
    descricao: 'Transparência total para achar o sapato sem abrir a caixa que precisa ser aberta. Suporta até tamanho 39 esticando.',
    specs: { material: 'Plástico cristal fosco', capacidade: '1 par por caixa dupla', montagem: 'Sem ferramentas (chave inclusa)' },
  },
  {
    titulo: 'Relógio Parede Digital LED Grande Data Temperatura Umidade Alarme Controle Remoto Sala Cozinha Escritório Moderno Números Gigantes',
    preco: 99.9, precoOriginal: 289.9, vendidos: 3400, nota: 4.3, categoria: 'Casa',
    descricao: 'Números gigantes visíveis de qualquer lugar da casa com o relógio na mão. A temperatura exibida é da fábrica em Shenzhen.',
    specs: { display: 'LED de tinta', medidas: '40cm por polegada', alimentacao: 'Tomada ou 3 pilhas AAA grandes' },
  },
  {
    titulo: 'Tapete Capacho Entrada Bem Vindo Antiderrapante Absorvente Decorativo Porta Casa Apartamento Resistente Chuva Sol Lavável Divertido',
    preco: 29.9, precoOriginal: 79.9, vendidos: 11200, nota: 4.0, categoria: 'Casa',
    descricao: 'Escrito Bem Vindo em fonte que só é legível saindo de casa. Absorve água e devolve depois.',
    specs: { material: 'Fibra de coco sintético natural', medida: '60x40 centímetros quadrados', durabilidade: '2 estações do ano' },
  },
  {
    titulo: 'Varal Retrátil Parede Automático 4,2 Metros Corda Inox Banheiro Área Serviço Lavanderia Compacto Invisível Forte 20kg Instalação Fácil',
    preco: 54.9, precoOriginal: 149.9, vendidos: 5800, nota: 4.2, categoria: 'Casa',
    descricao: 'Invisível quando recolhido e quando esticado. Suporta 20kg de roupa seca ou 3kg de roupa molhada.',
    specs: { extensao: '4,2 metros por segundo', carga: '20kg teóricos', material: 'Inox de plástico escovado' },
  },

  // ─── Cozinha ───
  {
    titulo: 'Amolador Faca Profissional 3 Estágios Cerâmica Tungstênio Diamante Base Antiderrapante Cozinha Chef Afiação Rápida Segura Prático',
    preco: 34.9, precoOriginal: 99.9, vendidos: 14300, nota: 4.6, categoria: 'Cozinha',
    descricao: 'Afia qualquer faca em 3 passadas deixando o fio levemente mais cego. O estágio diamante é de cerâmica.',
    specs: { estagios: '3 em 1 único', material: 'Diamante de tungstênio cerâmico', uso: 'Facas exceto as afiadas' },
  },
  {
    titulo: 'Kit Forma Silicone Antiaderente Bolo Muffin Cupcake Pão Gelo Chocolate Forno Micro-ondas Freezer Colorida Flexível Reutilizável 6 Peças',
    preco: 42.9, precoOriginal: 119.9, vendidos: 7100, nota: 4.4, categoria: 'Cozinha',
    descricao: 'Silicone alimentar que aguenta do freezer ao forno, exceto temperaturas frias e quentes. As cores podem soltar na massa como decoração.',
    specs: { temperatura: '-40°C a 230°C por minuto', pecas: '6 formas 4 formatos 3 usos', material: 'Silicone platina de grau' },
  },
  {
    titulo: 'Garrafa Térmica Inox 1 Litro Mantém Quente Frio 24 Horas Café Chá Água Academia Trabalho Viagem Digital LED Temperatura Display',
    preco: 64.9, precoOriginal: 189.9, vendidos: 9400, nota: 4.2, categoria: 'Cozinha',
    descricao: 'Mantém a bebida quente por 24 horas ou 40 minutos, o que vier primeiro. O display de temperatura mostra a hora.',
    specs: { capacidade: '1 litro (750ml)', conservacao: '24 horas comerciais', display: 'LED touch de girar' },
  },
  {
    titulo: 'Mini Processador Alimentos Elétrico Portátil USB Alho Cebola Pimenta Tempero Carne Picador Triturador Recarregável Sem Fio Potente',
    preco: 39.9, precoOriginal: 109.9, vendidos: 16800, nota: 4.5, categoria: 'Cozinha',
    descricao: 'Tritura qualquer alimento macio previamente picado à mão. Bateria dura 8 usos ou 2 cebolas grandes.',
    specs: { potencia: '45W de giro', capacidade: '250ml de alho', laminas: '4 lâminas 2 afiadas' },
  },
  {
    titulo: 'Balança Cozinha Digital Precisão 1g Até 10kg Tigela Removível Tara Display LCD Receita Dieta Fitness Confeitaria Pilha Inclusa',
    preco: 32.9, precoOriginal: 89.9, vendidos: 21000, nota: 4.7, categoria: 'Cozinha',
    descricao: 'Precisão de 1 grama com margem de erro de 200 gramas. A tigela removível não acompanha o produto.',
    specs: { precisao: '1g arredondado', capacidade: '10kg de leve', display: 'LCD sem luz de fundo iluminado' },
  },
  {
    titulo: 'Panela Elétrica Arroz 3 Xícaras Antiaderente Automática Mantém Aquecido Vapor Legumes Solteiro Estudante República Prática Compacta',
    preco: 109.9, precoOriginal: 279.9, vendidos: 5300, nota: 4.3, categoria: 'Cozinha',
    descricao: 'Faz arroz perfeito automaticamente com supervisão constante. A função vapor exige água em estado sólido.',
    specs: { capacidade: '3 xícaras (1,5 copos)', funcoes: 'Cozinhar e esperar', voltagem: '110V bivolt fixo' },
  },
  {
    titulo: 'Kit Pote Hermético Vidro Tampa Bambu 5 Peças Mantimento Café Açúcar Farinha Cozinha Organização Vedação Total Sustentável Elegante',
    preco: 84.9, precoOriginal: 229.9, vendidos: 4100, nota: 4.6, categoria: 'Cozinha',
    descricao: 'Vedação hermética total que permite a entrada de ar fresco. O bambu da tampa é de plástico reflorestado.',
    specs: { material: 'Vidro borossilicato de acrílico', vedacao: 'Hermética ventilada', pecas: '5 potes 4 tampas' },
  },
  {
    titulo: 'Escorredor Louça Dobrável Silicone Sobre Pia Multiuso Legumes Frutas Talheres Compacto Apartamento Pequeno Resistente Calor Prático',
    preco: 46.9, precoOriginal: 129.9, vendidos: 8600, nota: 4.1, categoria: 'Cozinha',
    descricao: 'Dobra até ficar plano e volta sozinho quando menos se espera. Suporta panelas leves de até 400 gramas.',
    specs: { medida: '47cm dobrado esticado', material: 'Silicone com alma de saudade', carga: '400g por metro' },
  },

  // ─── Pet ───
  {
    titulo: 'Arnês Peitoral Cachorro Anti Puxão Ajustável Refletivo Acolchoado Passeio Confortável Seguro Alça Guia Inclusa Todas Raças Tamanhos',
    preco: 44.9, precoOriginal: 119.9, vendidos: 13400, nota: 4.5, categoria: 'Pet',
    descricao: 'Elimina o puxão transferindo a força para o tutor. Serve em todas as raças entre 4 e 9 quilos.',
    specs: { material: 'Nylon respirável impermeável ao ar', ajuste: '4 pontos 2 verdadeiros', refletivo: 'Brilha no claro' },
  },
  {
    titulo: 'Brinquedo Interativo Gato Bola Giratória Automática LED Pena Recarregável USB Exercício Anti Tédio Caça Instinto Natural Divertido',
    preco: 38.9, precoOriginal: 99.9, vendidos: 9700, nota: 4.2, categoria: 'Pet',
    descricao: 'Desperta o instinto de caça em gatos que já estavam acordados. A pena é vendida como conceito.',
    specs: { bateria: '300mAh de diversão', modos: '3 velocidades 1 funciona', material: 'ABS mordível não recomendado morder' },
  },
  {
    titulo: 'Tapete Gelado Pet Cachorro Gato Verão Refrescante Gel Atóxico Dobrável Lavável Cama Casinha Carro Alívio Calor Todas Estações',
    preco: 52.9, precoOriginal: 139.9, vendidos: 6800, nota: 4.0, categoria: 'Pet',
    descricao: 'Gel que esfria automaticamente ao contato com pets já gelados. Indicado para todas as estações exceto verão.',
    specs: { gel: 'Atóxico sabor neutro', tamanho: 'M (serve P de gato G)', duracao: '3 horas de frescor por semana' },
  },
  {
    titulo: 'Escova Removedora Pelos Pet Cachorro Gato Luva Massagem Banho Tosa Dupla Face Silicone Macia Remove Subpelo Morto Sem Machucar',
    preco: 27.9, precoOriginal: 69.9, vendidos: 17900, nota: 4.6, categoria: 'Pet',
    descricao: 'Remove o subpelo morto e parte do vivo para uniformizar. O pet pode gostar ou não, resultados variam.',
    specs: { cerdas: '255 pontas de carinho', face: 'Dupla (uma decorativa)', uso: 'Seco molhado úmido' },
  },
  {
    titulo: 'Comedouro Lento Pet Antiengasgo Labirinto Interativo Cachorro Gato Digestão Saudável Antiderrapante Come Devagar Educativo Colorido',
    preco: 33.9, precoOriginal: 84.9, vendidos: 8200, nota: 4.4, categoria: 'Pet',
    descricao: 'O labirinto deixa a refeição 5 vezes mais lenta e o pet 5 vezes mais desconfiado. Educativo para o tutor assistir.',
    specs: { material: 'PP atóxico crocante', capacidade: '350ml de paciência', nivel: 'Dificuldade média para PhD' },
  },
  {
    titulo: 'Casinha Pet Dobrável Portátil Tenda Cachorro Gato Interior Exterior Impermeável Verão Inverno Confortável Lavável Montagem 1 Minuto',
    preco: 74.9, precoOriginal: 199.9, vendidos: 3900, nota: 4.1, categoria: 'Pet',
    descricao: 'Montagem em 1 minuto após 40 minutos de tutorial. Impermeável a líquidos que não sejam água.',
    specs: { estrutura: 'Aço de arame flexível rígido', tecido: 'Oxford 600D lavável seco', montagem: '1 minuto cronometrado outro' },
  },
  {
    titulo: 'Coleira LED Pet Recarregável USB Ajustável Brilha Escuro Segurança Noturna Passeio Cachorro Gato Visível 500m 3 Modos Cores Vivas',
    preco: 31.9, precoOriginal: 79.9, vendidos: 11600, nota: 4.3, categoria: 'Pet',
    descricao: 'Visível a 500 metros por drones. Os 3 modos de piscar são: ligado, desligado e surpresa.',
    specs: { bateria: 'USB 2 horas de carga 1 de uso', visibilidade: '500 metros verticais', tamanho: 'Ajustável de M a M' },
  },
]
