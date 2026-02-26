const edificiosTelefone1 = [
  "ALESSANDRO", "ANGELICA PAGANINI", "ATRIUM VERONA", "ANTONIO DI PIETRO", "BOLONHA", "CASA BLANCA", "CORDIALLE", "DEL PIETRO", "DOM HENRIQUE", "GABRIEL", "GRAAL", "ILHA DAS GARÇAS", "JUIZ PEDRO", "LAVINIA", "MAR E SOL", "MARIA BONFIM", "MIRADOR", "MOOREA BEACH", "NINIVE ALMEIDA", "PRAIA DAS VIRTUDES", "PRAIA BELLA", "PRIME", "REFINATTO", "RUBEM BRAGA", "SUMMER HILL", "TIFANY", "VARANDAS DO MAR", "VIENA"
];

const edificiosTelefone2 = [
  "ATOBA", "BELLAGIO", "CAIADO RODRIGUES", "CALIFORNIA", "CAROLINA", "CORAIS DA ENSEADA", "ENSEADA VIP", "GRANITO", "ILHA DE COMANDATUBA", "JEAN MARCEL", "LONG SUMMER", "MAESTRO", "MAIS JK", "MALIBU", "MARGARIDA MOTTA", "MAREK", "MAR DE VENEZA", "MONTE BLU", "MURANO", "PANORAMIC", "PERACANGA", "PONTAL D’AREIA", "PRAIA DE PERACANGA", "PREDILETTO", "RECANTO DA PRAIA", "SANTORINI", "SEVEN", "SERENATA", "SOLAR MARIZ", "SOLLARIUM", "SPLENDIA", "VENETO", "VERDES MARES"
];

function getPhoneNumber(edificio) {
  if (edificiosTelefone1.includes(edificio.toUpperCase())) {
    return "5527999626933";
  } else if (edificiosTelefone2.includes(edificio.toUpperCase())) {
    return "5527998173386";
  }
  return "5527998173386"; // Default phone number
}

function generateWhatsAppMessage() {
  const form = document.getElementById("locacaoForm");
  const data = new FormData(form);

  let message = "*Ficha de Controle de Locação*\n\n";

  message += `*Edifício:* ${data.get("edificio").trim()}\n`;
  message += `*Apartamento:* ${data.get("apartamento").trim()}\n`;
  message += `*Responsável:* ${data.get("responsavel").trim()}\n`;
  message += `*CPF:* ${data.get("cpf") ? data.get("cpf").trim() : ""}\n`;
  message += `*RG:* ${data.get("rg") ? data.get("rg").trim() : ""}\n`;
  message += `*Endereço:* ${data.get("endereco") ? data.get("endereco").trim() : ""}\n`;
  message += `*Cidade:* ${data.get("cidade") ? data.get("cidade").trim() : ""}\n`;
  message += `*UF:* ${data.get("uf") ? data.get("uf").trim() : ""}\n\n`;

  const vehicleRows = document.querySelectorAll("#vehicleContainer .vehicle-row");
  vehicleRows.forEach((row, index) => {
    const modelo = row.querySelector("input[name='modelo']").value.trim();
    const cor = row.querySelector("input[name='cor']").value.trim();
    const placa = row.querySelector("input[name='placa']").value.trim();
    if (modelo || cor || placa) {
      message += `*Veículo ${index + 1}:* ${modelo} ${cor} - Placa: ${placa}\n\n`;
    }
  });

  message += `*Data de Chegada:* ${formatDate(data.get("chegada"))}\n`;
  message += `*Data de Saída:* ${formatDate(data.get("saida"))}\n\n`;

  const personRows = document.querySelectorAll("#peopleContainer .person-row");
  personRows.forEach(row => {
    const nomeInput = row.querySelector("input[name='responsiblePersonName']") || row.querySelector("input[name='personName[]']");
    const docInput = row.querySelector("input[name='responsiblePersonDoc']") || row.querySelector("input[name='personDoc[]']");
    const isChildCheckbox = row.querySelector(".switch input[type='checkbox']");

    const nome = nomeInput ? nomeInput.value.trim() : "";
    const doc = docInput ? docInput.value.trim() : "";
    const isChild = isChildCheckbox && isChildCheckbox.checked ? " (criança)" : "";

    if (nome) {
      message += `*${nome}*${isChild}\nDocumento: ${doc}\n\n`;
    }
  });

  message += `*Condição do imóvel:* ${data.get("tipoLocacao")}`;

  return encodeURIComponent(message);
}

document.addEventListener("DOMContentLoaded", () => {
  const edificioInput = document.getElementById("edificioInput");
  const edificioSelectionModal = document.getElementById("edificioSelectionModal");
  const edificioList = document.getElementById("edificioList");

  const form = document.getElementById("locacaoForm");
  const reviewPage = document.getElementById("reviewPage");
  const finalizarBtn = document.querySelector(".finalizarBtn");
  const printBtn = document.querySelector(".printBtn");
  const whatsappBtn = document.querySelector(".whatsappBtn");
  const backToFormBtn = document.querySelector(".backToFormBtn");
  const encaminharBtn = document.querySelector(".encaminharBtn");

  // Edifício selection modal logic
  edificioInput.addEventListener("focus", () => {
    edificioSelectionModal.style.display = "flex";
    edificioList.innerHTML = "";
    [...edificiosTelefone1, ...edificiosTelefone2].sort().forEach(edificio => {
      const div = document.createElement("div");
      div.className = "edificio-item";
      div.textContent = edificio;
      div.addEventListener("click", () => {
        edificioInput.value = edificio;
        edificioSelectionModal.style.display = "none";
      });
      edificioList.appendChild(div);
    });
  });

  edificioSelectionModal.addEventListener("click", (event) => {
    if (event.target === edificioSelectionModal) {
      edificioSelectionModal.style.display = "none";
    }
  });

  // Form submission and review page logic
  finalizarBtn.addEventListener("click", () => {
    if (isFormValid()) {
      showReview();
      form.style.display = "none";
      reviewPage.style.display = "block";
    }
  });

  backToFormBtn.addEventListener("click", () => {
    reviewPage.style.display = "none";
    form.style.display = "block";
  });

  printBtn.addEventListener("click", () => {
    window.print();
  });

  whatsappBtn.addEventListener("click", () => {
    const edificioSelecionado = document.querySelector("input[name='edificio']").value;
    const phoneNumber = getPhoneNumber(edificioSelecionado);
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  });

  encaminharBtn.addEventListener("click", () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/?text=${message}`, "_blank");
  });

  // Add/remove person rows
  document.querySelector(".add-person").addEventListener("click", addPersonRow);
  document.querySelector(".add-vehicle").addEventListener("click", addVehicleRow);



  // Initial update for responsible person
  updateResponsiblePerson();
});

function updateResponsiblePerson() {
  const responsibleRow = document.querySelector(".person-row.responsible");
  const nome = document.querySelector("[name=responsavel]").value;
  const cpf = document.querySelector("[name=cpf]").value;
  const rg = document.querySelector("[name=rg]").value;
  responsibleRow.querySelector("input[name='responsiblePersonName']").value = nome;
  responsibleRow.querySelector("input[name='responsiblePersonDoc']").value = cpf && rg ? `${cpf} / ${rg}` : cpf || rg;
}

function formatCPF(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 9) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/^(\d{3})(\d{3})$/, "$1.$2");
  }
  input.value = value;
}

function formatPhone(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length > 10) {
    value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (value.length > 5) {
    value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  }
  input.value = value;
}

function showReview() {
  const form = document.getElementById("locacaoForm");
  const data = new FormData(form);
  const reviewContent = document.getElementById("reviewContent");
  reviewContent.innerHTML = "";

  let reviewHTML = `<div class="review-item"><span class="review-label">Edifício:</span> <span class="review-value">${data.get("edificio")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">Apartamento:</span> <span class="review-value">${data.get("apartamento")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">Responsável:</span> <span class="review-value">${data.get("responsavel")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">CPF:</span> <span class="review-value">${data.get("cpf")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">RG:</span> <span class="review-value">${data.get("rg")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">Endereço:</span> <span class="review-value">${data.get("endereco")}, ${data.get("numero")} - ${data.get("bairro")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">Cidade:</span> <span class="review-value">${data.get("cidade")}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">UF:</span> <span class="review-value">${data.get("uf")}</span></div>`;

  const vehicleContainer = document.getElementById("vehicleContainer");
  const vehicleRows = vehicleContainer.querySelectorAll(".vehicle-row");
  vehicleRows.forEach((row, index) => {
    const modelo = row.querySelector("input[name='modelo']").value.trim();
    const cor = row.querySelector("input[name='cor']").value.trim();
    const placa = row.querySelector("input[name='placa']").value.trim();
    if (modelo || cor || placa) {
      reviewHTML += `<div class="review-item"><span class="review-label">Veículo ${index + 1}:</span> <span class="review-value">${modelo} ${cor} - Placa: ${placa}</span></div>`;
    }
  });

  reviewHTML += `<div class="review-item"><span class="review-label">Data de Chegada:</span> <span class="review-value">${formatDate(data.get("chegada"))}</span></div>`;
  reviewHTML += `<div class="review-item"><span class="review-label">Data de Saída:</span> <span class="review-value">${formatDate(data.get("saida"))}</span></div>`;

  // Adiciona a lista de pessoas ao reviewHTML
  reviewHTML += `<div class="review-item" style="margin-top: 15px;"><span class="review-label">LISTA DE INQUILINOS:</span></div>`;
  const personRows = document.querySelectorAll("#peopleContainer .person-row");
  personRows.forEach(row => {
    const nomeInput = row.querySelector("input[name='responsiblePersonName']") || row.querySelector("input[name='personName[]']");
    const docInput = row.querySelector("input[name='responsiblePersonDoc']") || row.querySelector("input[name='personDoc[]']");
    const isChildCheckbox = row.querySelector(".switch input[type='checkbox']");

    const nome = nomeInput ? nomeInput.value.trim() : "";
    const doc = docInput ? docInput.value.trim() : "";
    const isChild = isChildCheckbox && isChildCheckbox.checked ? " (Criança)" : "";

    if (nome) {
      reviewHTML += `<div class="review-item" style="margin-left: 20px;"><span class="review-label">Nome:</span> <span class="review-value">${nome}</span></div>`;
      reviewHTML += `<div class="review-item" style="margin-left: 20px;"><span class="review-label">Documento:</span> <span class="review-value">${doc}</span> <span class="review-value">${isChild}</span></div>`;
    }
  });

  reviewContent.innerHTML = reviewHTML;
}

function addPersonRow() {
  const container = document.getElementById("peopleContainer");
  const newRow = document.createElement("div");
  newRow.className = "person-row";
  newRow.innerHTML = `
      <div class="col"><label>Nome:</label><input type="text" name="personName[]" required></div>
      <div class="col"><label>Documento:</label><input type="text" name="personDoc[]"></div>
    <div class="col">
      <label>Criança:</label>
      <label class="switch">
        <input type="checkbox">
        <span class="slider"></span>
      </label>
    </div>
    <div class="col">
        <button type="button" class="remove-button" onclick="this.parentElement.parentElement.remove()">REMOVER</button>
    </div>
  `;
  container.appendChild(newRow);
}

function addVehicleRow() {
  const container = document.getElementById("vehicleContainer");
  const newRow = document.createElement("div");
  newRow.className = "vehicle-row";
  newRow.innerHTML = `
    <div class="col"><label>Modelo:</label><input type="text" name="modelo" placeholder="Ex: Corola" required></div>
    <div class="col"><label>Cor:</label><input type="text" name="cor" placeholder="Ex: Prata" required></div>
    <div class="col"><label>Placa:</label><input type="text" name="placa" oninput="formatPlate(this)" required></div>
    <button type="button" class="remove-button" onclick="this.parentElement.remove()">REMOVER</button>
  `;
  container.appendChild(newRow);
}

function formatPlate(input) {
  let value = input.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (value.length > 7) {
    value = value.slice(0, 7);
  }

  if (value.length >= 4) {
    // Check if the 5th character is a letter (Mercosul format)
    if (/[A-Z]/.test(value[4])) {
      value = value.slice(0, 3) + value.slice(3, 4) + '-' + value.slice(4, 7);
    } else { // Traditional format
      value = value.slice(0, 3) + '-' + value.slice(3, 7);
    }
  }
  input.value = value;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Adiciona validação de data mínima (dia atual)
(function setMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Mês começa em 0
    let dd = today.getDate();

    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;

    const todayString = yyyy + '-' + mm + '-' + dd;

    const dataChegada = document.getElementById("dataChegada");
    const dataSaida = document.getElementById("dataSaida");

    if (dataChegada) dataChegada.setAttribute("min", todayString);
    if (dataSaida) dataSaida.setAttribute("min", todayString);
})();

function isFormValid() {
  const form = document.getElementById("locacaoForm");
  let firstInvalidField = null;

  const errorMessages = {
    edificio: "Selecione um edifício",
    apartamento: "Escreva o número do apartamento",
    responsavel: "Escreva o nome do responsável",
    telefone: "Escreva o número do telefone",
    modelo: "Informe o modelo do carro",
    cor: "Informe a cor do carro",
    placa: "Informe a placa do carro",
    chegada: "Informe uma data válida",
    saida: "Informe uma data válida",
    "personName[]": "Insira o nome de uma pessoa",
    tipoLocacao: "Selecione uma das opções"
  };

  // Remove existing tooltips
  form.querySelectorAll(".error-tooltip").forEach(tooltip => tooltip.remove());
  form.querySelectorAll(".invalid-field").forEach(field => field.classList.remove("invalid-field"));

  // 1. Check all required fields
  form.querySelectorAll("input[required], select[required], textarea[required]").forEach(input => {
    if (!input.checkValidity()) {
      if (!firstInvalidField) firstInvalidField = input;
      const message = errorMessages[input.name] || "Esta informação é obrigatória!";
      showError(input, message);
    }
  });

  // 2. Check for CPF or RG for the responsible person
  const cpfInput = form.querySelector("[name=cpf]");
  const rgInput = form.querySelector("[name=rg]");
  if (!cpfInput.value && !rgInput.value) {
    if (!firstInvalidField) firstInvalidField = cpfInput;
    showError(cpfInput, "CPF ou RG é obrigatório.");
    showError(rgInput, "CPF ou RG é obrigatório.");
  }

  // 3. Check for document for each person in the list
  const personRows = document.querySelectorAll("#peopleContainer .person-row");
  personRows.forEach(row => {
    const docInput = row.querySelector("input[name='responsiblePersonDoc']") || row.querySelector("input[name='personDoc[]']");
    if (docInput && !docInput.value) {
        if(!firstInvalidField) firstInvalidField = docInput;
        showError(docInput, "O documento é obrigatório.");
    }
  });


  if (firstInvalidField) {
    firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  return true;
}

function showError(input, message) {
  input.classList.add("invalid-field");
  const tooltip = document.createElement("div");
  tooltip.className = "error-tooltip";
  tooltip.textContent = message;
  input.parentNode.style.position = "relative";
  input.parentNode.appendChild(tooltip);

  input.addEventListener("input", () => {
      if (input.classList.contains('invalid-field')) {
        input.classList.remove("invalid-field");
        const parent = input.parentNode;
        const tooltip = parent.querySelector(".error-tooltip");
        if (tooltip) {
            parent.removeChild(tooltip);
        }
      }
  });
}
