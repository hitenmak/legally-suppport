// const bscScan = {
//     transactionDetails: 'https://bscscan.com/tx/', // transaction id
//     walletDetails: 'https://bscscan.com/address/', // wallet address
//     walletDetailsTag: '#tokentxns',
// }


const cellViewType = (data = '', configRow, search) => {
    if([null, 'null', undefined, 'undefined'].includes(data)) data = '';
    
    const cardStatus = {
        '0': {label: 'Request Received', className: 'badge-outline-secondary'},
        '2': {label: 'Payment Received', className: 'badge-outline-primary'},
        '3': {label: 'Undelivered', className: 'badge-outline-primary'},
        '5': {label: 'Delivered', className: 'badge-outline-primary'},
        '6': {label: 'Card Binding', className: 'badge-outline-info'},
        '7': {label: 'KYC Processing', className: 'badge-outline-info'},
        '8': {label: 'KYC Rejected', className: 'badge-outline-warning'},
        '9': {label: 'KYC Completed', className: 'badge-outline-info'},
        '10': {label: 'Card Activated', className: 'badge-outline-success'},
    };
    return {

        image: `<img alt="Avatar" class="table-avatar imagePreviewModel" src="${data}">`,

        details: `<div class="row-details-box rowDetailsBox" data-toggle="long"><span class="description">${data}</span></div>`,
        // details: `<div class="row-details-box rowDetailsBox" data-toggle="long"><span class="description">${data}</span><span class="read-all toggleRead">Show ></span><span class="read-all hide-btn toggleRead">Hide ></span></div>`,

        badge: `<span class="badge ${configRow?.classes || 'badge-secondary'}">${data}</span>`,

        status: `<i class="bi ${data ? 'bi-circle-fill text-success' : 'bi-circle-fill text-secondary opacity-50'}"></i>`,

        readUnread: `<i class="fa-solid fa-check-double ${data ? 'text-success' : 'text-secondary opacity-50'}"></i>`,

        star: `<i class="fa-solid fa-star ${data ? 'text-warning' : 'text-secondary opacity-50'}"></i>`,

        checkMarkProgress: `<i class="bi ${data ? 'bi-check-lg text-success' : 'bi-arrow-clockwise text-warning opacity-50'}"></i>`,

        withdrawStatus: `<span class="badge badge-pill ${['badge-outline-secondary', 'badge-outline-success', 'badge-outline-danger', 'badge-outline-warning', 'badge-outline-info'][data]}">${['Pending', 'Success', 'Failed', 'Rejected', 'Cancelled'][data]}</span>`,
        
        giftRewardStatus: `<span class="badge badge-pill ${['badge-outline-secondary', 'badge-outline-success', 'badge-outline-danger', 'badge-outline-warning', 'badge-outline-info'][data]}">${['Pending', 'Success', 'Failed', 'Rejected', 'Cancelled'][data]}</span>`,

        rewardCampaignStatus: `<span class="badge badge-pill ${['badge-outline-secondary', 'badge-outline-success', 'badge-outline-danger'][data]}">${['Pending', 'Approved','Rejected'][data]}</span>`,

        exchangeOwnershipStatus: `<span class="badge badge-pill ${['badge-outline-info', 'badge-outline-info', 'badge-outline-info', 'badge-outline-danger', 'badge-outline-secondary','badge-outline-success'][data]}">${['Application Received, Payment Pending', 'Payment Received','KYC Pending', 'Document Rejected', 'Refunded', 'Confirmed'][data]}</span>`,

        cardRewardStatus: `<span class="badge badge-pill ${['badge-outline-info', 'badge-outline-secondary', 'badge-outline-success', 'badge-outline-danger'][data]}">${['Pending','In Process', 'Success', 'Failed'][data]}</span>`,

        lastActive: `<span class="badge badge-pill ${(data + '').includes('days') || (data + '').includes('years') || (data + '').includes('months') ? ((data + '').includes('days') ? 'badge-outline-warning' : ((data + '').includes('months') ? 'badge-outline-danger' : 'badge-outline-secondary')) : 'badge-outline-success'}">${data}</span>`,

        linkText: `<a href="${data?.redirectUrl}">${data?.label}</a>`,

        // custom
        linkTextBscWalletDetails: `<a href="https://bscscan.com/address/${data}#tokentxns" target="_blank">${data}</a>`,
        linkTextBscTransactionDetails: `<a href="https://bscscan.com/tx/${data}" target="_blank">${data}</a>`,
        url: `<a href="${data}" target="_blank">${data}</a>`,
        socialLinksRewardCampaign: `
        <a href="${data.facebook}" target="_blank"><i class="bi bi-facebook fa-2x pr-5"></i></a>
        <a href="${data.instagram}" target="_blank"><i class="bi bi-instagram fa-2x pr-5"></i></a>
        <a href="${data.telegram}" target="_blank"><i class="bi bi-telegram fa-2x pr-5"></i></a>
        <a href="${data.youtube}" target="_blank"><i class="bi bi-youtube fa-2x"></i></a>`,
        cardStatus: `<span class="badge badge-pill ${cardStatus[data]?.className}">${cardStatus[data]?.label}</span>`,
        emptyToNA: `<span>${data?.length ? data : 'N/A'}</span>`,
        attachment: `<div class="image-rectangle"><img src="${data}" class="imagePreviewModel" alt="User Attachment"></div>`,
        actionCheckbox: `<input type="checkbox" data-id="${data}" class="_deleteSelected" value="${data}">`,
        actionIsDeletedDisableCheckbox: data?.isDeleted ? `<span></span>` :`<input type="checkbox" data-id="${data?._id}" class="_deleteSelected" value="${data?.isDeleted}">`,
        negativeValueToZeroWithBadge: `<span class="badge ${configRow?.classes || 'badge-secondary'}">${data < 0 ? 0: data}</span>`,

    }[configRow.displayType] || makeSearchHighlight(data ?? '', search);

    // return data;
    // return makeSearchHighlight(data, pager.filters.commonSearch) || '';
}

$(document).on('click', '.rowDetailsBox', function(){
    const el = $(this);
    const toggleClass = el.attr('data-toggle');
    if(el.hasClass(toggleClass)) el.removeClass(toggleClass);
    else el.addClass(toggleClass);
    // el.addClass()
    // const box = el.closest()
})

const cellActionBtn = (data) => {
    let btnHtml = ``;


    // Edit
    if (data.actionEdit)
        btnHtml += `<a type="button" class="btn btn-sm bg-gradient-secondary" href="${data.actionEdit}"><i class="bi bi-pencil-square"></i></a>`;

    // Details
    if (data.actionDetails)
        btnHtml += `<a type="button" class="btn btn-sm bg-gradient-info" href="${data.actionDetails}"><i class="bi bi-info-square"></i></a>`;

    // Approve
    if (data.actionApprove) {
        btnHtml += `<button class="btn btn-sm bg-gradient-dark confirmApproval" data-id="${data.actionApprove}" ${data.status ? 'disabled' : ''}><i class="bi bi-patch-check"></i></button>`;
    }

    // Exchange Ownership Approve
    if (data.actionOwnershipApprove) {
        btnHtml += `<button class="btn btn-sm bg-gradient-dark confirmApproval" data-id="${data.actionOwnershipApprove}" ${data.status != 2 ? 'disabled' : ''}><i class="bi bi-patch-check"></i></button>`;
    }

    // Delete
    if (data.actionDelete)
        // btnHtml += `<button type="button" class="btn btn-sm bg-gradient-danger"><i class="bi bi-trash"></i></button>`;
        btnHtml += `<button class="btn btn-sm bg-gradient-danger confirmDelete" data-url="${data.actionDelete}"><i class="bi bi-trash"></i></button>`;

    if (data.actionDeleteDirect)
        // btnHtml += `<button type="button" class="btn btn-sm bg-gradient-danger"><i class="bi bi-trash"></i></button>`;
        btnHtml += `<a class="btn btn-sm bg-gradient-danger" href="${data.actionDeleteDirect}"><i class="bi bi-trash"></i></a>`;


    if (btnHtml.length) btnHtml = `<td><div class="btn-group">${btnHtml}</div></td>`;
    return btnHtml;
}