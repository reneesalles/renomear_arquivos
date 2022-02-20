// variáveis globais
var files_list = [];

$(document).ready(init);
$(document).on("paste", pasteHandler);

// entrada do programa (também pode ser usado para resetar a tela)
function init() {
    files_list = [];
    updateTable();
}

function pasteHandler(ev) {
    try {
        ev.preventDefault();
        let $target = $(ev.target);

        if ($target.is(".form-control")) {
            let paste = (ev.originalEvent.clipboardData || window.clipboardData).getData('text');
            paste = paste.toUpperCase();

            let rows = paste.split('\n');

            let $tbody = $target.closest('tbody');
            let $inputs = $tbody.find('.form-control');
            let index = $inputs.index($target);

            for (let i = index, r = 0; i < files_list.length && r < rows.length; i++, r++) {
                // pegar o novo nome desejado para o arquivo
                $(`.new_file_name:eq(${i}) input`).val(rows[r]);
            }
        }
    }
    catch (exception) {
        console.error(exception);
    }
}

// função auxiliar para incluir novo arquivo no files_list
function addFileToList(file) {
    files_list.push(file);
    updateTable();
}

// função auxiliar para remover um arquivo numa posição específica do files_list
function removeFileFromList(i) {
    files_list.splice(i, 1);
    updateTable();
}

// função auxiliar para limpar todo o files_list
function removeAllFilesFromList() {
    files_list = [];
    updateTable();
}

function clearInput(sender) {
    $(sender).closest(".new_file_name").find(".form-control").val("");
}

function clearAllInputs() {
    $(".new_file_name").find(".form-control").val("");
}

// função que atualiza a tabela contendo a lista de arquivos
function updateTable() {
    // conferir se files_list possuir ao menos 1 arquivo
    let hasFiles = files_list.length > 0;

    // se hasFiles for true, remover classe "d-none"
    // se hasFiles for false, adicionar classe "d-none"
    $("#removeAllBtn, #clearAllInputsBtn, #downloadAllBtn")[hasFiles ? 'removeClass' : 'addClass']("d-none");

    // criar um acesso à table
    let $files_list = $("#files_list");
    // criar um acesso ao tbody da table
    let $tbody = $files_list.find("tbody");

    // limpar o tbody
    $tbody.html("");

    // loop por todo o files_list
    for (let i = 0; i < files_list.length; i++) {
        // pegar o arquivo no índice 'i' do files_list
        let file = files_list[i];
        // pegar o nome (sem extensão) do arquivo
        let filename = file.name.split('.').slice(0, -1).join('.');
        // pegar a extensão (sem ponto) do arquivo
        let extension = file.name.split('.').pop();

        // criar o template da linha da tabela representando o arquivo
        let rowTemplate = `
            <tr>
                <td class="file_extension">
                    <img src="Images/Icons/${extension}.png" onerror="getDefaultImage(event);" />
                    ${extension}
                </td>
                <td class="file_name">
                    <span>${filename}</span>
                </td>
                <td class="new_file_name">
                    <div class="input-group input-group-sm">
                        <input class="form-control" type="text" />
                        <div class="input-group-append">
                            <button class="btn btn-warning" type="button" onclick="clearInput(this);">Limpar</button>
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger btn-block" type="button" onclick="removeFileFromList(${i});">Remover</button>
                </td>
            </tr>
        `;

        // adicionar a linha no final do tbody
        $tbody.append(rowTemplate);
    }
}

// evento para carregar foto default, caso extensão não possuir um ícone
function getDefaultImage(ev) {
    ev.target.src = "Images/Icons/unknown.png";
    ev.onerror = null;
}

// evento chamado pelo "Clique Aqui"
function uploadFiles(ev) {
    for (let i = 0; i < ev.target.files.length; i++) {
        let file = ev.target.files[i];
        addFileToList(file);
    }
}

// evento chamado pelo "Arraste aqui"
function dropHandler(ev) {
    // remover "capa" da tela
    $('#drop_zone').removeClass('file_over');

    // Impedir o comportamento padrão (impedir que o arquivo seja aberto)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        // Use a interface DataTransferItemList para acessar o (s) arquivo (s)
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            // Se os itens soltos não forem arquivos, rejeite-os
            if (ev.dataTransfer.items[i].kind === 'file') {
                let file = ev.dataTransfer.items[i].getAsFile();
                addFileToList(file);
            }
        }
    } else {
        // Use a interface DataTransfer para acessar o (s) arquivo (s)
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
            let file = ev.dataTransfer.files[i];
            addFileToList(file);
        }
    }
}

// evento chamado quando algo estiver sendo arrastado e estiver em cima do #drop_zone
function dragOverHandler(ev) {
    // adicionar "capa" na tela
    $('#drop_zone').addClass('file_over');

    // Impedir o comportamento padrão (impedir que o arquivo seja aberto)
    ev.preventDefault();
}

// evento chamado quando algo estiver sendo arrastado e sair de cima do #drop_zone
function dragLeaveHandler(ev) {
    // remover "capa" da tela
    $('#drop_zone').removeClass('file_over');
}

// função que vai validar todos os campos de texto da table
function validateTable() {
    // criar variável auxiliar que vai armazenar os possíveis erros
    let errors = "";

    // loop por todo o files_list
    for (let i = 0; i < files_list.length; i++) {
        // pegar o novo nome desejado para o arquivo
        let filename = $(`.new_file_name:eq(${i}) input`).val();
        // validar se filename está vazio
        if ((filename ?? "").trim() == "") {
            // se errors não estiver vazio, pular linha com "\n"
            errors += errors.trim().length == 0 ? "" : "\n";
            // adicionar nova mensagem de erro
            errors += `[linha ${i + 1}]: nome de arquivo deve ser preenchido!`;
        }
    }

    // alertar mensagens de erro se errors não estiver vazio
    if (errors.trim().length > 0) {
        alert(errors);
        return false;
    }

    return true;
}

// função que vai fazer um loop por todos os files_list para executar download individualmente
function downloadAll() {
    // checar se os inputs da table estão válidos
    if (validateTable()) {
        // loop por todo o files_list
        for (let i = 0; i < files_list.length; i++) {
            // pegar o arquivo no índice 'i' do files_list
            let file = files_list[i];
            // pegar a extensão (sem ponto) do arquivo
            let extension = file.name.split('.').pop();
            // pegar o novo nome desejado para o arquivo
            let filename = $(`.new_file_name:eq(${i}) input`).val();
            // realizar o download com o novo nome de arquivo
            download(`${filename}.${extension}`, file);
            // apagar o arquivo da memória
            file = undefined;
        }
        // limpar toda a lista ao terminar os downloads
        files_list = [];
    }
}

// função que vai baixar um arquivo
function download(filename, file) {
    // criar uma tag a (anchor)
    var element = document.createElement('a');
    // criar um objeto URL representando o arquivo a ser baixado
    let fileUrl = URL.createObjectURL(new File([file], filename));

    // apontar o link da tag anchor para o objeto URL
    element.setAttribute('href', fileUrl);
    // apontar o nome do arquivo a ser baixado
    element.setAttribute('download', filename);

    // ocultar a tag anchor
    element.style.display = 'none';
    // adicionar a tag anchor à tag body (senão o click virtual não funciona)
    document.body.appendChild(element);

    // realizar um click virtual para executar o download do arquivo
    element.click();

    // remover a tag anchor
    document.body.removeChild(element);
}