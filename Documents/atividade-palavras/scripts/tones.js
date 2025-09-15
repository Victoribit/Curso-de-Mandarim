// BLOCO 2: MARK THE TONES YOU HEAR
const tonesBlock = {
    // Gabarito de tons corretos
    answers: {
      "1. Chuanglian": ["1","2"],
      "2. Caochang": ["1","3"],
      "3. Fangxiang": ["1","4"],
      "4. Guojia": ["2","1"],
      "5. Renmin": ["2","2"],
      "6. Maobi": ["2","3"],
      "7. Xuexiao": ["2","4"],
      "8. Diandeng": ["4","1"],
      "9. Baozhi": ["4","3"],
      "10. Shulin": ["4","2"],
      "11. Xiju": ["4","4"],
      "12. Daban": ["3","neutro"]
    },
  
    // Variáveis para controle de áudio
  audio: null,
  isPlaying: false,

  // Inicializar o bloco de tons
  init: function() {
    console.log('Inicializando seção de tons');
    
    // Configurar o áudio
    this.setupAudio();
    
    // Configurar os botões de áudio
    this.setupAudioControls();
    
    // Configurar as questões de tons
    this.setupToneQuestions();
  },

  // Configurar o elemento de áudio
  setupAudio: function() {
    this.audio = new Audio('audios/lesson2.m4a');
    
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updatePlayPauseButton();
    });
    
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updatePlayPauseButton();
    });
    
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updatePlayPauseButton();
    });
  },

  // Configurar os controles de áudio
  setupAudioControls: function() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const restartBtn = document.getElementById('restart-btn');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartAudio();
      });
    }
  },

  // Alternar entre play e pause
  togglePlayPause: function() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  },

  // Reiniciar o áudio
  restartAudio: function() {
    this.audio.currentTime = 0;
    if (!this.isPlaying) {
      this.audio.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  },

  // Atualizar o botão de play/pause
  updatePlayPauseButton: function() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (this.isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
    } else {
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
    }
  },

  // Configurar as questões de tons (a lógica anterior)
  setupToneQuestions: function() {
    document.querySelectorAll("#tones-list li").forEach(li => {
      const word = li.firstChild.textContent.trim();
      const selects = li.querySelectorAll("select");
      const result = li.querySelector(".result");
      const showAnswerBtn = li.querySelector(".show-answer-btn");
      const answerDisplay = li.querySelector(".answer-display");

      // Adicionar evento para mostrar resposta
      showAnswerBtn.addEventListener("click", () => {
        if (this.answers[word]) {
          answerDisplay.textContent = `Resposta: ${this.answers[word][0]}, ${this.answers[word][1]}`;
          answerDisplay.style.display = "inline";
        }
      });

      // Adicionar eventos para os selects
      selects.forEach(sel => {
        sel.addEventListener("change", () => {
          const chosen = [selects[0].value, selects[1].value];
          if (chosen[0] && chosen[1]) {
            if (this.answers[word] && chosen[0] === this.answers[word][0] && chosen[1] === this.answers[word][1]) {
              result.textContent = "✔️";
              result.style.color = "green";
            } else {
              result.textContent = "❌";
              result.style.color = "red";
            }
          } else {
            result.textContent = "";
          }
        });
      });
    });
  }
};

// Inicializar quando o DOM estiver pronto
if (document.getElementById('tones-block')) {
  tonesBlock.init();
}