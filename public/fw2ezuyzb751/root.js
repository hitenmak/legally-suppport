const dd = (data, label) => {
    if (label) console.log(data, label);
    else console.log(data);
};

const empty = (data) => {
    if ([undefined, 'undefined', null, 'null', ''].includes(data) || typeof data === 'object' && Object.keys(data).length === 0)
        return true;
    return typeof data === 'string' && !data.trim().length;

};

const loaderShow = () => {
    $('.pageLoader').show();
    $('body').addClass('overflow-hidden');
};


const loaderHide = () => {
    $('.pageLoader').hide();
    $('body').removeClass('overflow-hidden');
};


const toastSuccess = (msg) => {
    toastr.success(msg);
};


const toastError = (msg) => {
    toastr.error(msg);
};


const toastMake = (res, msg = null) => {
    res.isSuccess ? toastSuccess(msg || res.message) : toastError(msg || res.message);
};

const elements = {
    errorMsg: `<span class="text-danger text-sm errMsg">This field is required.</span>`,
    errorMsgLive: `<span class="text-danger text-sm errorMsgLive ">This field is not valid.</span>`,
};

const icons = {
    arrowUp: '<i class="ml-2 c-pointer font-weight-bolder bi bi-arrow-up"></i>',
    arrowDown: '<i class="ml-2 c-pointer font-weight-bolder bi bi-arrow-down"></i>',
    arrowUpDowns: '<i class="ml-2 c-pointer font-weight-bolder bi bi-arrow-down-up text-muted"></i>',
};

// Helpers { ----------------------------------------------------------------

const getUrl = (routeName) => {
    return viewData.baseUrl + routeName;
};


const getErrorEl = (className, message) => {
    const errorMsgLive = $(elements.errorMsgLive);
    errorMsgLive.text(message).addClass(className);
    return errorMsgLive;
};


const init = (cb) => {
    $(document).ready(function () {
        cb();
    });
};


const makeSearchHighlight = (paragraph, search) => {
    // return paragraph;
    if (empty(search) || typeof search === 'object') return paragraph;

    search = search.toString();
    paragraph = paragraph.toString();
    return paragraph.replace(new RegExp(search, 'gi'), '<mark>$&</mark>');
    // return search.length > 0 ? paragraph.replace(re, `<ser>$&</ser>`) : paragraph;
};


const bindActionBtn = (data) => {
    if (!pageConfig.showRowAction) return '';
    let btnHtml = ``;
    // <button type="button" class="btn bg-gradient-warning"><i class="bi bi-eye"></i></button>
    btnHtml += cellActionBtn(data);


    return btnHtml;
};


// --------------------------------------------------------------------------

let viewData = {};
init(() => {
    viewData = JSON.parse($('#viewData').text());
    dd(viewData);
});


// Pager { ----------------------------------------------------------------
let tableLayout = {};
let pageConfig = {
    showRowAction: true,
    showDownloadReport: false,
};
let recordUrls = {};
let pager = {};
const resetPager = () => {
    pager = {
        isPushedCount: false,
        isGetCount: false,
        isGenerateReport: false,
        filters: { commonSearch: null },
        pageSize: 10,
        orderBy: { createdAt: 'desc' },
        pageNumber: 1,
        totalPages: null,
        totalRecords: null,
        isShowAll: false,
        tableLayout: {},
        records: [],
    };
};


const tableLoaderShow = (isShow = 1) => {
    if (isShow) {
        loaderShow();
        $('#tw ._tableLoaderContent').hide();
        $('#tw ._tableFooter ._tableLoaderContent').hide();
        $('#tw ._tableLoader').show();
        $('#tw ._tableNoRecord').hide();
    } else {
        loaderHide();
        $('#tw ._tableLoaderContent').show();
        $('#tw ._tableFooter ._tableLoaderContent').show();
        $('#tw ._tableLoader').hide();
    }

};


const tableFooterPagerLoaderShow = (isShow = 1) => {
    if (isShow) {
        $('#tw ._tableFooter ._tableLoaderContent').hide();
        // $('#tw ._tableFooter ._tableLoader ._footerEntries').hide();
        $('#tw ._tableFooter ._tableLoader ._footerEntries ._entriesLoad').hide();
        $('#tw ._tableFooter ._tableLoader ._footerEntries ._entriesStatic').show();
        $('#tw ._tableFooter ._tableLoader').show();
    } else {
        $('#tw ._tableFooter ._tableLoaderContent').show();
        // $('#tw ._tableFooter ._tableLoader ._footerEntries').show();
        $('#tw ._tableFooter ._tableLoader ._footerEntries ._entriesLoad').show();
        $('#tw ._tableFooter ._tableLoader ._footerEntries ._entriesStatic').hide();
        $('#tw ._tableFooter ._tableLoader').hide();
    }


};


const tableNoRecordShow = (isShow = 1) => {
    if (isShow) {
        $('#tw ._tableFooter').hide();
        $('#tw ._tableNoRecord').show();
    } else {
        $('#tw ._tableFooter').show();
        $('#tw ._tableNoRecord').hide();

    }

};


const initTable = (isReset = true, isGetPage = true) => {

     $('._downloadReport').hide();
     $('#tw ._tableNoRecord').hide();
    if(pageConfig.showDownloadReport) $('._downloadReport').show();

    if (isReset) {
        resetPager();
        pager.tableLayout = tableLayout;

        const currentKey = Object.keys(pager.orderBy)[0];
        const currentOrder = pager.orderBy[currentKey];

        const tableWrapperEl = $('.bin._tableWrapper').clone();
        tableWrapperEl.removeClass('bin').addClass('live');
        tableWrapperEl.appendTo('#tw');
        const headEl = $('#tw ._head');
        headEl.append(`<th style="width: 10px">#</th>`);
        for (const key in tableLayout) {
            let cr = tableLayout[key];
            // let shortIcon = (currentKey===key) ? (currentOrder==='asc' ? icons.arrowUp : icons.arrowDown ) : icons.arrowUpDowns;
            let shortIcon = icons.arrowUpDowns;
            let sortingArrows = cr.isSortable ? `<span class="${cr.isSortable ? '_sortColumn' : ''}" data-column="${key}">` + shortIcon + `</span>` : '';
            headEl.append(`<th class="_columnShortArrow"><span class="_labelSort c-pointer">${cr.label}${sortingArrows}</span></th>`);
        }
        if (pageConfig.showRowAction) headEl.append(`<th>Action</th>`);
    }
    if(isGetPage) getPage();
    initTableLoader();
};


const initTableLoader = () => {
    const tbodyEl = $('#tw ._tbodyLoader');

    let tbodyHtml = ``;
    [{}, {}, {}, {}, {},].forEach(rec => {
        tbodyHtml += `<tr><td><span class="row-loading lod-badge">&emsp;</span></td>`;
        for (const key in tableLayout) {
            tbodyHtml += `<td><span class="row-loading lod-text">&emsp;</span></td>`;
        }
        tbodyHtml += pageConfig.showRowAction ? `<td><span class="row-loading lod-action-btn">&emsp;</span></td>` : '';
        tbodyHtml += `</tr>`;

    });
    tbodyEl.html(tbodyHtml);
};


const getPage = (pageNo = null) => {

    tableLoaderShow();
    if (pageNo !== null) pager.pageNumber = pageNo;
    if (pageNo === 'ALL') {
        pager.pageSizeBin = pager.pageSize;
        pager.pageSize = pager.totalRecords * pager.totalPages;
        pager.pageNumber = 1;
        pager.isShowAll = true;
    } else if (pageNo === 'LESS') {
        pager.pageSize = pager.pageSizeBin;
        pager.pageNumber = 1;
        pager.isShowAll = false;
    }

    pager.records = [];
    dd(pager);
    $.ajax({
        url: getUrl(recordUrls.listing),
        type: 'POST',
        dataType: 'json',
        data: pager,
        success: function (res) {
            if (res.isSuccess && res.data) {
                pager = { ...pager, ...res.data };
                dd(pager);
                initTableRows();
                initSortArrows();
            }

        }
    });
};


const initTableRows = async () => {
    const tbodyEl = $('#tw ._tbody');
    // $('#status, #fromDate, #toDate, #amountFrom, #amountTo').attr("readonly", true);
    index = (pager.pageNumber * pager.pageSize) - pager.pageSize;
    let tbodyHtml = ``;
    tableNoRecordShow(pager.totalRecords === 0);
    pager.records.forEach(rec => {
        index += 1;
        tbodyHtml += `<tr><td>${index}</td>`;
        for (const key in tableLayout) {
            tbodyHtml += `<td>${cellViewType(rec[key], tableLayout[key], pager?.filters?.commonSearch)}</td>`;
        }
        tbodyHtml += bindActionBtn(rec) || '';
        tbodyHtml += `</tr>`;

    });
    tbodyEl.html(tbodyHtml);
    tableFooterPagerLoaderShow();
    // await getPagerFooterData();
    initPagerFooter();
    tableLoaderShow(0);
    // tableNoRecordShow;
};


/*const getPagerFooterData = async () => {
    // if(pager.isPushedCount){
    //     initPagerFooter();
    //     pager.isGetCount = false;
    //     return;
    // }
    return new Promise((resolve, reject) => {
        pager.isGetCount = true;
        pager.isPushedCount = true;
        $.ajax({
            url: getUrl(recordUrls.listing),
            type: 'POST',
            dataType: 'json',
            data: {...pager, records: null},
            success: function (res) {
                dd(res);
                if (res.isSuccess && res.data) {
                    pager.isGetCount = false;
                    pager = { ...pager, ...res.data };
                    dd(pager);
                    $('#status, #fromDate, #toDate, #amountFrom, #amountTo').removeAttr("readonly");
                    initPagerFooter();
                    resolve(pager);
                }
            }
        });
    })
}*/


const initPagerFooter = () => {
    const footerEl = $('#tw ._pageButtons');
    const totalBtn = 5;

    let pagerBtnHtml = `<ul class="pagination paginationList pagination-sm m-0 float-right _pagerBtn">`;
    pagerBtnHtml += `<li class="page-item ${pager.pageNumber == 1 ? 'disabled' : 'goToPage'}" data-pg-no="1"><a class="page-link">&laquo;</a></li>`;
    pagerBtnHtml += `<li class="page-item ${pager.pageNumber == 1 ? 'disabled' : 'goToPage'}" data-pg-no="${pager.pageNumber - 1}"><a class="page-link">Prev</a></li>`;

    let printPageBtnNo = 0;
    if (pager.pageNumber - totalBtn <= 0 && pager.pageNumber < 3) {
        printPageBtnNo = 1;
    } else if (pager.pageNumber >= 3 && pager.pageNumber < pager.totalPages - 1) {
        printPageBtnNo = pager.pageNumber - 2;
    } else {
        printPageBtnNo = pager.totalPages - totalBtn + 1;
        if (printPageBtnNo <= 0) printPageBtnNo = 1;
    }

    for (let i = printPageBtnNo; i < printPageBtnNo + totalBtn; i++) {
        if (i <= pager.totalPages) pagerBtnHtml += `<li class="page-item ${pager.pageNumber == i ? 'active' : 'goToPage'}" data-pg-no="${i}"><a class="page-link">${i}</a></li>`;
    }

    pagerBtnHtml += `<li class="page-item ${pager.pageNumber == pager.totalPages ? 'disabled' : 'goToPage'}" data-pg-no="${pager.pageNumber + 1}"><a class="page-link">Next</a></li>`;
    pagerBtnHtml += `<li class="page-item ${pager.pageNumber == pager.totalPages ? 'disabled' : 'goToPage'}" data-pg-no="${pager.totalPages}"><a class="page-link">&raquo;</a></li>`;
    pagerBtnHtml += `</ul>`;

    if (!pager.totalRecords) pagerBtnHtml = '';
    footerEl.html(pagerBtnHtml);

    // Page Counts {
    const pageCountDetailsEl = $('#tw ._pageCountDetails');
    const pageEndRecords = pager.pageNumber * pager.pageSize;
    let pageCountDetailsHtml = `Showing ${((pager.pageNumber * pager.pageSize) - pager.pageSize) + 1} to ${pager.isShowAll ? pager.totalRecords : (pager.totalRecords < pageEndRecords ? pager.totalRecords : pageEndRecords)} of ${pager.totalRecords} entries`;
    // if (1) {
    /*if (pager.isShowAll) pageCountDetailsHtml += `&ensp;—&ensp;<a class="c-pointer goToPage" data-pg-no="LESS"> Show Less <i class="fas fa-angle-up"></i></a>`;
    else pageCountDetailsHtml += `&ensp;—&ensp;<a class="c-pointer goToPage" data-pg-no="ALL"> Show All <i  class="fas fa-angle-right"></i></a>`;*/
    // }

    if (!pager.totalRecords) {
        pageCountDetailsHtml = '';
        $('._pagerTotalRecords').text(0);
    };

    pageCountDetailsEl.html(pageCountDetailsHtml);
    if (pager.totalRecords) $('._pagerTotalRecords').removeClass('d-none').text(pager.totalRecords);
    // } Page Counts
    tableLoaderShow(0);
    tableFooterPagerLoaderShow(0);


};


const initSortArrows = () => {
    const headEl = $('#tw ._head');
    const currentKey = Object.keys(pager.orderBy)[0];
    const currentOrder = pager.orderBy[currentKey];

    headEl.find('._sortColumn i').removeClass('bi-arrow-down-up').removeClass('bi-arrow-up').removeClass('bi-arrow-down').addClass('bi-arrow-down-up');

    let shortIconClass = currentOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
    headEl.find(`._sortColumn[data-column="${currentKey}"] i`).addClass(shortIconClass);

};


const applyFilters = (query, columnName) => {
    pager.filters[columnName] = query;
    getPage(1);

};

const setFilters = (query, columnName) => {
    pager.filters[columnName] = query;
};

// --------------------------------------------------------------------------


// Actions { ----------------------------------------------------------------


$(document).on('click', '.goToPage', function () {
    getPage($(this).attr('data-pg-no'));
});


$(document).on('click', '._clearSearch', function () {
    resetPager();
    // dd(pager)
    pager.isPushedCount = false;
    pager.isGetCount = true;
    getPage(1);
});


$(document).on('click', '#tw ._labelSort', function () {
    let columnName = $(this).find('._sortColumn').attr('data-column');
    let currentKey = Object.keys(pager.orderBy)[0];
    let currentOrder = pager.orderBy[currentKey];
    if (columnName === currentKey) {
        pager.orderBy[columnName] = currentOrder === 'desc' ? 'asc' : 'desc';
    } else {
        pager.orderBy = {};
        pager.orderBy[columnName] = 'asc';
    }
    getPage(1);

});


let tblSearchTimer;
let doneTypingInterval = 500;
$(document).on('input', '._dtSearch', function () {
    clearTimeout(tblSearchTimer);
    tblSearchTimer = setTimeout(() => {
        applyFilters($(this).val(), $(this).attr('data-column'));
    }, doneTypingInterval);
});


$(document).on('click', '._downloadReport', function () {
    $('._downloadReport').attr('disabled', 'disabled');
    $('._downloadReport .btnLoader').show();
    $('._downloadReport .btnLabel').hide();
    pager.isGenerateReport = true;
    const xPager = { ...pager };
    xPager.records = [];
    $.ajax({
        url: getUrl(recordUrls.listing),
        type: 'POST',
        dataType: 'json',
        data: xPager,
        success: function (res) {
            // dd(res,'res==>1')
            // dd(res?.data,'res==>2')
            if (res.isSuccess && res?.data?.downloadUrl) {
                // pager = { ...pager, ...res.data };
                window.open(res?.data?.downloadUrl, '_blank');
                pager.isGenerateReport = false;
            }
            $('._downloadReport .btnLoader').hide();
            $('._downloadReport .btnLabel').show();
            $('._downloadReport').removeAttr('disabled');

        },
        error: function (err) {
            pager.isGenerateReport = false;
            $('._downloadReport .btnLoader').hide();
            $('._downloadReport .btnLabel').show();
            $('._downloadReport').removeAttr('disabled');
        }
    });
})

// Form Helper { --------------------------------------------------------------------------
//  requiredData
init(() => {
    const requiredEl = $('#this_form .requiredData');
    requiredEl.each(i => {
        const el = $(requiredEl[i]).parent('div');
        el.parent('div').find('label').after(`<b class="text-danger"> *</b>`);
    });
});


$(document).on('input', '#this_form .requiredData', function () {
    $(this).parent('div').find('.errMsg').remove();
    if (empty($(this).val())) $(this).after(elements.errorMsg);
});


$('#this_form').submit(function () {
    const requiredEl = $('#this_form .requiredData');
    if ($('.errorMsgLive').length) return false;
    $('.errMsg').remove();
    let isValid = true;
    requiredEl.each(i => {
        const el = $(requiredEl[i]).parent('div');
        const val = el.find('.requiredData').val();
        const type = el.find('.requiredData').attr('type');
        if (empty(val)) {
            isValid = false;
            if (type === 'file')
                el.find('.requiredData').closest('div.input-group').after(elements.errorMsg);
            else
                el.find('.requiredData').after(elements.errorMsg);
        }

    });
    if (isValid) loaderShow();
    return isValid;
});
// --------------------------------------------------------------------------


// Actions { ----------------------------------------------------------------
$(document).on('click', '.confirmDelete', function () {
    const url = $(this).attr('data-url');
    const el = $('#confirm_delete');
    el.find('.deleteSave').attr('href', url);
    el.modal('show');
});

// $(document).on('click', '.updateApprovalStatus', function () {
//     // debugger
//     const status = $(this).attr('data-status');
//     const id = $(this).closest('.modal').find('input[name="id"]').val();
//     $.ajax({
//         url: getUrl('withdraw-request'),
//         type: 'POST',
//         dataType: 'json',
//         data: { status, id },
//         success: function (res) {
//             $('#confirm_approval').modal('hide');
//             getPage(1);
//             toastMake(res);
//         }
//     });
// });