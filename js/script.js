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

// Scroll suave, FAQ, reveals e calculadora.
document.addEventListener("DOMContentLoaded", () => {
  const ctaElements = document.querySelectorAll("[data-cta]");
  const faqButtons = document.querySelectorAll(".faq-question");
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
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
});
