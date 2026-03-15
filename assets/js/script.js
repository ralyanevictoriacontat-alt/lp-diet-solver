function parseNonNegativeNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
}

function formatHours(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function formatCurrencyBRLInteger(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function formatMediaTime(value) {
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateCalculadoraTempoFaturamento() {
  const pacientesSemana = parseNonNegativeNumber(document.getElementById("calc-pacientes")?.value);
  const minutosPorDieta = parseNonNegativeNumber(document.getElementById("calc-minutos")?.value);
  const valorConsulta = parseNonNegativeNumber(document.getElementById("calc-valor")?.value);

  const horasSemanaisAtual = (pacientesSemana * minutosPorDieta) / 60;
  const horasMensaisAtual = horasSemanaisAtual * 4;

  const minutosComDietSolver = minutosPorDieta * 0.4;
  const horasMensaisComDietSolver = ((pacientesSemana * minutosComDietSolver) / 60) * 4;
  const economiaMensalHoras = horasMensaisAtual - horasMensaisComDietSolver;

  const tempoEconomizadoMinutos = economiaMensalHoras * 60;
  const pacientesAdicionais = minutosPorDieta > 0
    ? Math.floor(tempoEconomizadoMinutos / minutosPorDieta)
    : 0;

  const adicionalMensal = pacientesAdicionais * valorConsulta;

  const horasSemanaisEl = document.getElementById("calc-horas-semanais");
  const horasMensaisEl = document.getElementById("calc-horas-mensais");
  const economiaHorasEl = document.getElementById("calc-economia-horas");
  const pacientesExtraEl = document.getElementById("calc-pacientes-extra");
  const valorExtraEl = document.getElementById("calc-valor-extra");

  if (horasSemanaisEl) horasSemanaisEl.textContent = formatHours(horasSemanaisAtual);
  if (horasMensaisEl) horasMensaisEl.textContent = formatHours(horasMensaisAtual);
  if (economiaHorasEl) economiaHorasEl.textContent = formatHours(economiaMensalHoras);
  if (pacientesExtraEl) pacientesExtraEl.textContent = String(pacientesAdicionais);
  if (valorExtraEl) valorExtraEl.textContent = formatCurrencyBRLInteger(adicionalMensal);
}

function initCalculadoraTempoFaturamento() {
  const inputIds = ["calc-pacientes", "calc-minutos", "calc-valor"];
  const inputs = inputIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (!inputs.length) return;

  inputs.forEach((input) => {
    input.addEventListener("input", updateCalculadoraTempoFaturamento);
  });

  updateCalculadoraTempoFaturamento();
}

function initTestimonialsLoop() {
  const marquee = document.querySelector(".testimonials-marquee");
  const track = marquee?.querySelector(".testimonials-track");

  if (!marquee || !track) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  let animationFrameId = 0;
  let lastTimestamp = 0;
  let isPaused = false;
  let resumeTimeoutId = 0;
  let isPointerDragging = false;
  let pointerStartX = 0;
  let pointerStartScrollLeft = 0;

  const getBaseSpeed = () => (window.innerWidth <= 640 ? 0.3 : 0.42);

  const getLoopPoint = () => track.scrollWidth / 2;

  const normalizeLoopPosition = () => {
    const loopPoint = getLoopPoint();
    if (!loopPoint) return;

    if (marquee.scrollLeft >= loopPoint) {
      marquee.scrollLeft -= loopPoint;
    } else if (marquee.scrollLeft <= 0) {
      marquee.scrollLeft += loopPoint;
    }
  };

  const pauseLoop = () => {
    isPaused = true;
    if (resumeTimeoutId) {
      window.clearTimeout(resumeTimeoutId);
      resumeTimeoutId = 0;
    }
  };

  const resumeLoop = () => {
    isPaused = false;
  };

  const resumeLoopLater = () => {
    if (resumeTimeoutId) window.clearTimeout(resumeTimeoutId);
    resumeTimeoutId = window.setTimeout(() => {
      resumeLoop();
    }, 1800);
  };

  const beginPointerDrag = (event) => {
    if (event.pointerType === "touch") return;
    isPointerDragging = true;
    pointerStartX = event.clientX;
    pointerStartScrollLeft = marquee.scrollLeft;
    marquee.classList.add("is-dragging");
    if (typeof marquee.setPointerCapture === "function") {
      marquee.setPointerCapture(event.pointerId);
    }
    pauseLoop();
  };

  const movePointerDrag = (event) => {
    if (!isPointerDragging) return;
    const distance = event.clientX - pointerStartX;
    marquee.scrollLeft = pointerStartScrollLeft - distance;
    normalizeLoopPosition();
  };

  const endPointerDrag = () => {
    if (!isPointerDragging) return;
    isPointerDragging = false;
    marquee.classList.remove("is-dragging");
    resumeLoopLater();
  };

  const step = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const loopPoint = getLoopPoint();

    if (!isPaused && !isPointerDragging && loopPoint > 0) {
      marquee.scrollLeft += delta * getBaseSpeed();
      normalizeLoopPosition();
    }

    animationFrameId = window.requestAnimationFrame(step);
  };

  marquee.addEventListener("mouseenter", pauseLoop);
  marquee.addEventListener("mouseleave", resumeLoopLater);
  marquee.addEventListener("focusin", pauseLoop);
  marquee.addEventListener("focusout", resumeLoopLater);
  marquee.addEventListener("wheel", () => {
    pauseLoop();
    resumeLoopLater();
  }, { passive: true });
  marquee.addEventListener("touchstart", pauseLoop, { passive: true });
  marquee.addEventListener("touchmove", pauseLoop, { passive: true });
  marquee.addEventListener("touchend", resumeLoopLater, { passive: true });
  marquee.addEventListener("touchcancel", resumeLoopLater, { passive: true });
  marquee.addEventListener("pointerdown", beginPointerDrag);
  marquee.addEventListener("pointermove", movePointerDrag);
  marquee.addEventListener("pointerup", endPointerDrag);
  marquee.addEventListener("pointercancel", endPointerDrag);
  marquee.addEventListener("lostpointercapture", endPointerDrag);
  marquee.addEventListener("pointerleave", endPointerDrag);
  marquee.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    pauseLoop();
    resumeLoopLater();
  });
  marquee.addEventListener("scroll", () => {
    normalizeLoopPosition();
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseLoop();
      return;
    }

    resumeLoopLater();
  });

  marquee.scrollLeft = getLoopPoint();
  animationFrameId = window.requestAnimationFrame(step);

  window.addEventListener("resize", () => {
    normalizeLoopPosition();
  });

  window.addEventListener("beforeunload", () => {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    if (resumeTimeoutId) window.clearTimeout(resumeTimeoutId);
  });
}

// Scroll suave, FAQ, reveals e calculadora.
document.addEventListener("DOMContentLoaded", () => {
  const ctaElements = document.querySelectorAll("[data-cta]");
  const faqButtons = document.querySelectorAll(".faq-question");
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const audioHint = document.querySelector(".vsl-audio-hint");
  const heroVideo = document.querySelector("#hero-video");
  const videoPlayToggle = document.querySelector(".video-play-toggle");
  const videoPlayIcon = document.querySelector(".video-play-icon");
  const videoProgress = document.querySelector(".video-progress");
  const videoCurrentTime = document.querySelector(".video-current-time");
  const videoDuration = document.querySelector(".video-duration");
  const revealElements = document.querySelectorAll(
    ".pain .reveal, .solution .reveal, .beneficios-reveal, .puff-reveal, .showcase-reveal"
  );

  // Tracking de todos os CTAs via console.
  ctaElements.forEach((element) => {
    element.addEventListener("click", () => {
      const ctaName = element.getAttribute("data-cta") || "cta-sem-id";
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: "cta_click", cta_name: ctaName });
      }
    });
  });

  // Smooth scroll para links de ancora.
  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const cleanId = targetId.startsWith("#")
        ? decodeURIComponent(targetId.slice(1))
        : targetId;
      const targetElement = document.getElementById(cleanId);
      if (!targetElement) return;

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Acordeao do FAQ (abre/fecha item clicado).
  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const answer = button.closest(".faq-item")?.querySelector(".faq-answer");

      if (!answer) return;

      faqButtons.forEach((otherButton) => {
        const otherAnswer = otherButton.closest(".faq-item")?.querySelector(".faq-answer");
        otherButton.setAttribute("aria-expanded", "false");
        if (otherAnswer) otherAnswer.hidden = true;
      });

      button.setAttribute("aria-expanded", String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });

  if (audioHint) {
    audioHint.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (heroVideo) {
        heroVideo.play().catch(() => {});
      }

      audioHint.classList.add("is-hidden");
      audioHint.setAttribute("aria-hidden", "true");

      window.setTimeout(() => {
        audioHint.remove();
      }, 220);
    }, { once: true });
  }

  if (heroVideo) {
    heroVideo.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    const syncVideoUi = () => {
      const duration = heroVideo.duration || 0;
      const currentTime = heroVideo.currentTime || 0;
      const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0;

      if (videoProgress) {
        videoProgress.value = String(progressValue);
        videoProgress.style.setProperty("--progress", `${progressValue}%`);
      }

      if (videoCurrentTime) {
        videoCurrentTime.textContent = formatMediaTime(currentTime);
      }

      if (videoDuration) {
        videoDuration.textContent = formatMediaTime(duration);
      }

      if (videoPlayToggle) {
        videoPlayToggle.setAttribute(
          "aria-label",
          heroVideo.paused ? "Reproduzir video" : "Pausar video"
        );
      }

      if (videoPlayIcon) {
        videoPlayIcon.textContent = heroVideo.paused ? ">" : "||";
      }
    };

    if (videoPlayToggle) {
      videoPlayToggle.addEventListener("click", () => {
        if (heroVideo.paused) {
          heroVideo.play().catch(() => {});
          return;
        }

        heroVideo.pause();
      });
    }

    if (videoProgress) {
      const seekVideo = () => {
        const duration = heroVideo.duration || 0;
        const percent = parseFloat(videoProgress.value);
        if (!duration || Number.isNaN(percent)) return;
        heroVideo.currentTime = (percent / 100) * duration;
        syncVideoUi();
      };

      videoProgress.addEventListener("input", seekVideo);
      videoProgress.addEventListener("change", seekVideo);
    }

    heroVideo.addEventListener("click", () => {
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
        return;
      }

      heroVideo.pause();
    });

    heroVideo.addEventListener("loadedmetadata", syncVideoUi);
    heroVideo.addEventListener("timeupdate", syncVideoUi);
    heroVideo.addEventListener("play", syncVideoUi);
    heroVideo.addEventListener("pause", syncVideoUi);
    heroVideo.addEventListener("ended", syncVideoUi);

    syncVideoUi();
  }

  // Animacoes de entrada.
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  // Inicializa calculadora.
  initCalculadoraTempoFaturamento();
  initTestimonialsLoop();
});
