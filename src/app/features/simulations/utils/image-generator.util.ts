/**
 * Utilitário para geração de imagem da simulação
 * 
 * Para usar este recurso, instale o pacote:
 * npm install html-to-image --save
 * 
 * Exemplo de uso:
 * 
 * import { generateSimulationImage } from './image-generator.util';
 * 
 * const element = document.getElementById('result-card');
 * await generateSimulationImage(element, 'minha-simulacao');
 */

/**
 * Gera uma imagem PNG de um elemento HTML
 * 
 * @param element - Elemento HTML a ser convertido em imagem
 * @param filename - Nome do arquivo (sem extensão)
 */
export async function generateSimulationImage(
  element: HTMLElement,
  filename: string = 'simulacao-cartao'
): Promise<void> {
  try {
    // Importação dinâmica do html-to-image
    const htmlToImage = await import(/* @vite-ignore */ 'html-to-image');
    
    // Converte o elemento em PNG
    const dataUrl = await htmlToImage.toPng(element, {
      quality: 1,
      pixelRatio: 2, // Para melhor qualidade em telas retina
      cacheBust: true,
    });
    
    // Cria link de download
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    console.log('Imagem gerada com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    throw new Error(
      'Não foi possível gerar a imagem. Certifique-se de que o pacote html-to-image está instalado.'
    );
  }
}

/**
 * Gera uma imagem JPEG de um elemento HTML
 * 
 * @param element - Elemento HTML a ser convertido em imagem
 * @param filename - Nome do arquivo (sem extensão)
 * @param quality - Qualidade da imagem (0.0 a 1.0)
 */
export async function generateSimulationImageJpeg(
  element: HTMLElement,
  filename: string = 'simulacao-cartao',
  quality: number = 0.95
): Promise<void> {
  try {
    const htmlToImage = await import(/* @vite-ignore */ 'html-to-image');
    
    const dataUrl = await htmlToImage.toJpeg(element, {
      quality,
      pixelRatio: 2,
      cacheBust: true,
    });
    
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    
    console.log('Imagem JPEG gerada com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar imagem JPEG:', error);
    throw new Error('Não foi possível gerar a imagem JPEG.');
  }
}

/**
 * Copia a imagem da simulação para o clipboard
 * 
 * @param element - Elemento HTML a ser convertido em imagem
 */
export async function copySimulationImageToClipboard(
  element: HTMLElement
): Promise<void> {
  try {
    const htmlToImage = await import(/* @vite-ignore */ 'html-to-image');
    
    const blob = await htmlToImage.toBlob(element, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });
    
    if (!blob) {
      throw new Error('Não foi possível gerar blob da imagem');
    }
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    
    console.log('Imagem copiada para o clipboard!');
  } catch (error) {
    console.error('Erro ao copiar imagem:', error);
    throw new Error('Não foi possível copiar a imagem para o clipboard.');
  }
}

/**
 * Compartilha a imagem da simulação (usando Web Share API)
 * 
 * @param element - Elemento HTML a ser convertido em imagem
 * @param title - Título para compartilhamento
 * @param text - Texto para compartilhamento
 */
export async function shareSimulationImage(
  element: HTMLElement,
  title: string = 'Simulação de Venda no Cartão',
  text: string = 'Confira esta simulação de venda no cartão'
): Promise<void> {
  try {
    // Verifica se o navegador suporta Web Share API
    if (!navigator.share) {
      throw new Error('Navegador não suporta compartilhamento');
    }
    
    const htmlToImage = await import(/* @vite-ignore */ 'html-to-image');
    
    const blob = await htmlToImage.toBlob(element, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });
    
    if (!blob) {
      throw new Error('Não foi possível gerar blob da imagem');
    }
    
    const file = new File([blob], 'simulacao.png', { type: 'image/png' });
    
    await navigator.share({
      title,
      text,
      files: [file],
    });
    
    console.log('Imagem compartilhada com sucesso!');
  } catch (error) {
    console.error('Erro ao compartilhar imagem:', error);
    throw new Error('Não foi possível compartilhar a imagem.');
  }
}
