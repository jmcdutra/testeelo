// src/App.jsx
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

// Função para importar automaticamente todos os arquivos dentro da pasta assets
const importMedia = () => {
  // Importa todos os arquivos de mídia na pasta assets com as extensões especificadas
  const files = import.meta.glob('./assets/*.{jpg,jpeg,png,mp4}', { eager: true });

  // Mapeia os arquivos importados para um formato utilizável no React
  return Object.values(files).map((module) => {
    const src = module.default; // Pega o caminho do arquivo importado
    const isVideo = src.endsWith('.mp4'); // Verifica se o arquivo é um vídeo
    return {
      type: isVideo ? 'video' : 'image',
      src,
    };
  });
};

function App() {
  const [media] = useState(importMedia()); // Lista de reprodução gerada dinamicamente
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false); // Estado para controlar se o programa foi iniciado
  const videoRef = useRef(null);

  useEffect(() => {
    if (!started) return; // Se o programa não foi iniciado, não faz nada

    const currentMedia = media[currentIndex];
    let timer;

    if (currentMedia.type === 'image') {
      setProgress(0);
      const duration = 10000; // 10 segundos para imagens
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
            return 0;
          }
          return prev + (100 / (duration / 100)); // Atualiza a cada 100ms
        });
      }, 100);
    } else if (currentMedia.type === 'video') {
      setPlaying(true);
      setProgress(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [currentIndex, media, started]);

  const handleVideoEnd = () => {
    setPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handleVideoProgress = (state) => {
    if (media[currentIndex].type === 'video' && videoRef.current) {
      const duration = videoRef.current.getDuration();
      setProgress((state.playedSeconds / duration) * 100);
    }
  };

  const handleStart = () => {
    setStarted(true); // Marca que o programa foi iniciado após o clique no botão
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' }}>
      {!started ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            color: '#fff',
          }}
        >
          <h1>Bem-vindo ao ELO MÍDIAS!</h1>
          <button
            onClick={handleStart}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              cursor: 'pointer',
              backgroundColor: '#34cf91',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Iniciar Programa
          </button>
        </div>
      ) : media[currentIndex]?.type === 'image' ? (
        <img
          src={media[currentIndex].src}
          alt="Media"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <ReactPlayer
          ref={videoRef}
          url={media[currentIndex].src}
          playing={playing}
          muted={false} // O vídeo não precisa estar mudo, pois o usuário já interagiu com o site
          controls={false} // Remove controles de vídeo para manter a experiência fullscreen
          onEnded={handleVideoEnd}
          onProgress={handleVideoProgress}
          width="100%"
          height="100%"
          style={{ objectFit: 'cover' }}
          config={{
            file: {
              attributes: {
                autoPlay: true, // Garante que o vídeo comece a tocar automaticamente
                playsInline: true, // Para evitar problemas de reprodução em iOS
              },
            },
          }}
        />
      )}
      {started && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: `${progress}%`,
            height: '5px',
            backgroundColor: '#b949de', // Cor da barra de progresso
            transition: 'width 0.1s linear',
          }}
        />
      )}
    </div>
  );
}

export default App;
