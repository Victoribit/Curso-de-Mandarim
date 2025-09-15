document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada');

    /* ============================
       Função genérica de ÁUDIO
       ============================ */
    function setupAudioControls(cardId, audioPath) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const audio = new Audio(audioPath);
        let isPlaying = false;

        const playBtn = card.querySelector(".play-pause-btn");
        const restartBtn = card.querySelector(".restart-btn");
        if (!playBtn || !restartBtn) return;

        const playIcon = playBtn.querySelector(".play-icon");
        const pauseIcon = playBtn.querySelector(".pause-icon");

        function updateButton() {
            if (isPlaying) {
                playIcon.style.display = "none";
                pauseIcon.style.display = "inline";
            } else {
                playIcon.style.display = "inline";
                pauseIcon.style.display = "none";
            }
        }

        audio.addEventListener("play", () => { 
            isPlaying = true; 
            updateButton(); 
        });
        audio.addEventListener("pause", () => { 
            isPlaying = false; 
            updateButton(); 
        });
        audio.addEventListener("ended", () => { 
            isPlaying = false; 
            updateButton(); 
        });

        playBtn.addEventListener("click", () => {
            isPlaying ? audio.pause() : audio.play().catch(console.error);
        });

        restartBtn.addEventListener("click", () => {
            audio.currentTime = 0;
            if (!isPlaying) audio.play().catch(console.error);
        });
    }

    /* ============================
       Função genérica MOSTRAR RESPOSTA
       ============================ */
    function setupShowAnswerButtons(listId) {
        const list = document.getElementById(listId);
        if (!list) return;

        list.querySelectorAll("li").forEach(li => {
            const btn = li.querySelector(".show-answer-btn");
            const answer = li.querySelector(".answer-display");
            if (btn && answer) {
                btn.addEventListener("click", () => {
                    answer.style.display = "inline";
                });
            }
        });
    }

    /* ============================
       SEÇÃO DE TONS: ✔️ / ❌
       ============================ */
    const toneAnswers = {
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
    };

    function setupToneValidation() {
        const list = document.getElementById("tones-list");
        if (!list) return;

        list.querySelectorAll("li").forEach(li => {
            const word = li.firstChild.textContent.trim();
            const selects = li.querySelectorAll("select");
            const result = li.querySelector(".result");
            const showAnswerBtn = li.querySelector(".show-answer-btn");
            const answerDisplay = li.querySelector(".answer-display");

            // Mostrar resposta ao clicar
            showAnswerBtn.addEventListener("click", () => {
                if (toneAnswers[word]) {
                    answerDisplay.textContent = `Resposta: ${toneAnswers[word][0]}, ${toneAnswers[word][1]}`;
                    answerDisplay.style.display = "inline";
                }
            });

            // Validar seleção de tons
            selects.forEach(sel => {
                sel.addEventListener("change", () => {
                    const chosen = [selects[0].value, selects[1].value];
                    if (chosen[0] && chosen[1]) {
                        if (toneAnswers[word] && chosen[0] === toneAnswers[word][0] && chosen[1] === toneAnswers[word][1]) {
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

    function setupInputValidation(listId) {
        const list = document.getElementById(listId);
        if (!list) return;
    
        // Remove diacríticos (acento) para comparação mais tolerante
        function stripDiacritics(str) {
            try {
                return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            } catch (e) {
                return str;
            }
        }
    
        list.querySelectorAll("li").forEach(li => {
            const inputs = li.querySelectorAll("input");
            const answerDisplay = li.querySelector(".answer-display");
            if (!inputs.length || !answerDisplay) return;
    
            // Criar ou reaproveitar o span de resultado
            let result = li.querySelector(".result");
            if (!result) {
                result = document.createElement("span");
                result.className = "result";
                result.style.marginLeft = "8px";
                li.appendChild(result);
            }
    
            function validate() {
                const nodes = Array.from(li.childNodes);
                // encontra índice do primeiro input (para pular o "1. " inicial)
                const firstInputIndex = nodes.findIndex(n => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'INPUT');
                if (firstInputIndex === -1) return;
    
                // concatena inputs + textos entre os inputs, parando quando chega nos controles
                let userAnswer = "";
                for (let i = firstInputIndex; i < nodes.length; i++) {
                    const node = nodes[i];
    
                    // elemento
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node;
                        const tag = el.tagName;
                        // se for input, pega valor
                        if (tag === 'INPUT') {
                            userAnswer += el.value.trim();
                            continue;
                        }
                        // se for controle, pare (botão, select, answer-display, show-answer-btn)
                        if (tag === 'BUTTON' || tag === 'SELECT' || el.classList.contains('answer-display') || el.classList.contains('show-answer-btn')) {
                            break;
                        }
                        // outros elementos (por exemplo spans contendo sílabas) -> adiciona texto sem espaços
                        userAnswer += (el.textContent || "").replace(/\s+/g, '').trim();
                    }
    
                    // nó de texto
                    else if (node.nodeType === Node.TEXT_NODE) {
                        // remove apenas espaços em branco (preserva caracteres como ē, ǎ, etc.)
                        userAnswer += node.textContent.replace(/\s+/g, '');
                    }
                }
    
                const correctAnswer = answerDisplay.textContent.replace(/^Resposta:\s*/i, '').trim();
    
                const normUser = stripDiacritics(userAnswer).replace(/\s+/g, '').toLowerCase();
                const normCorrect = stripDiacritics(correctAnswer).replace(/\s+/g, '').toLowerCase();
    
                if (!normUser) {
                    result.textContent = "";
                    return;
                }
    
                if (normUser === normCorrect) {
                    result.textContent = "✔️";
                    result.style.color = "green";
                } else {
                    result.textContent = "❌";
                    result.style.color = "red";
                }
            }
    
            // ativa validação em todos os inputs dessa linha
            inputs.forEach(input => input.addEventListener("input", validate));
        });
    }
    
    function setupTwoInputsValidation() {
        document.querySelectorAll("li.initials-2inputs").forEach(li => {
            const inputs = li.querySelectorAll("input");
            const answerDisplay = li.querySelector(".answer-display");
            if (inputs.length !== 2 || !answerDisplay) return;
    
            let result = li.querySelector(".result");
            if (!result) {
                result = document.createElement("span");
                result.className = "result";
                result.style.marginLeft = "8px";
                li.appendChild(result);
            }
    
            function stripDiacritics(str) {
                try { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
                catch(e){ return str; }
            }
    
            function validate() {
                let userAnswer = "";
                li.childNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'INPUT') {
                        userAnswer += node.value.trim();
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        userAnswer += node.textContent.replace(/_/g,'').trim();
                    }
                });
    
                const correctAnswer = answerDisplay.textContent.replace(/^Resposta:\s*/i,'').trim();
    
                const normUser = stripDiacritics(userAnswer).replace(/\s+/g,'').toLowerCase();
                const normCorrect = stripDiacritics(correctAnswer).replace(/\s+/g,'').toLowerCase();
    
                if (!normUser) {
                    result.textContent = "";
                    return;
                }
    
                if (normUser === normCorrect) {
                    result.textContent = "✔️";
                    result.style.color = "green";
                } else {
                    result.textContent = "❌";
                    result.style.color = "red";
                }
            }
    
            inputs.forEach(input => input.addEventListener("input", validate));
        });
    }
    
    
    /* ============================
       Inicialização de ÁUDIO
       ============================ */
    setupAudioControls("initials-finals-block", "audios/lesson1.m4a");
    setupAudioControls("tones-block", "audios/lesson2.m4a");
    setupAudioControls("syllables-block", "audios/lesson3.m4a");

    /* ============================
       Inicialização de BOTÕES de resposta
       ============================ */
    setupShowAnswerButtons("initials-list");
    setupShowAnswerButtons("tones-list");
    setupShowAnswerButtons("syllables-list");

    /* ============================
       Inicialização da VALIDAÇÃO de tons
       ============================ */
    setupToneValidation();
    setupInputValidation("initials-list");
    setupInputValidation("syllables-list");
});

// Limpar respostas da seção 1 (initials/finals)
document.getElementById("clear-initials")?.addEventListener("click", () => {
    const list = document.getElementById("initials-list");
    if (!list) return;
  
    list.querySelectorAll("input").forEach(input => input.value = "");
    list.querySelectorAll(".result").forEach(r => r.textContent = "");
    list.querySelectorAll(".answer-display").forEach(ans => ans.style.display = "none");
  });
  
  // Limpar respostas da seção 2 (tones)
document.getElementById("clear-tones")?.addEventListener("click", () => {
    const list = document.getElementById("tones-list");
    if (!list) return;
  
    list.querySelectorAll("select").forEach(select => select.value = "");
    list.querySelectorAll(".result").forEach(r => r.textContent = "");
    list.querySelectorAll(".answer-display").forEach(ans => ans.style.display = "none");
  });
  
