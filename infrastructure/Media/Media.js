require('dotenv').config();

// Helpers
const { d, dd, empty, toList, getFileName } = require('../../helpers/helpers');
const MulterMethods = require('./MulterMethods');


//---------------------------------------------------------------------------------------------

const defaultImageName = 'default-placeholder.png';

const defaultFolderName = 'default';
const emailFolderName = 'email';
const userFolderName = 'users';
const supportAttachmentFolderName = 'support-attachment';
const mediaPostFolderName = 'media-post';
const advertisementFolderName = 'advertisement';
const configMediaFolderName = 'config-media';
const cardAttachmentFolderName = 'card-attachment';
const exchangeOwnershipAttachmentFolderName = 'exchange-ownership-attachment';
const badgeFolderName = 'badges';
const giftFolderName = 'gifts';
const newIfcGiftFolderName = 'newifc-gifts';
const performanceMeterName = 'performance-meter';
const defaultGiftImageName = 'gifts';



//---------------------------------------------------------------------------------------------


// Defaults ||||||||||||||||||||||||||||||||||||||||||||||||
getDefaultImage = (image, isFullUrl = 1) => {
    return image ? MulterMethods.getBaseUrl(isFullUrl) + defaultFolderName + '/' + image : '';
};
exports.getDefaultImage = getDefaultImage;

// Mails ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getEmailImage = (image, isFullUrl = 1) => {
    return image ? MulterMethods.getBaseUrl(isFullUrl) + emailFolderName + '/' + image : '';
};

// Get Email Image ||||||||||||||||||||||||||||||||||||||||||||||||
// getEmailImage = (image, isFullUrl = 1) => {
//     return image ? getBaseUrl(isFullUrl) + emailMediaFolderName + '/' + image : null;
// };
// exports.getEmailImage = getEmailImage;


// Users ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getUserImage = (image, isFullUrl = 1, isDefault = 0) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + userFolderName + '/' + image : '';
    return returnImage;
    // return returnImage ? returnImage : getDefaultImage('ifx-user-profile.png', isFullUrl);
    // return returnImage ? returnImage : getDefaultImage('user-profile.png', isFullUrl);
};

exports.getAdminUserImage = (image, isFullUrl = 1, isDefault = 0) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + userFolderName + '/' + image : '';
    return returnImage ? returnImage : getDefaultImage('ifc-user-profile.png', isFullUrl);
};

exports.getIfxUserImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + userFolderName + '/' + image : '';
    return returnImage;
    // return returnImage ? returnImage : getDefaultImage('ifx-user-profile.png', isFullUrl);
};

exports.getUsdtUserImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + userFolderName + '/' + image : '';
    return returnImage;
};

exports.storeUserImage = (fieldName) => {
    return MulterMethods.single(fieldName, userFolderName);
};

exports.deleteUserImage = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, userFolderName,);
};


// Support Attachment ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getSupportAttachment = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + supportAttachmentFolderName + '/' + image : '';
    return returnImage ? returnImage : getDefaultImage('user-profile.png', isFullUrl);
};

exports.storeSupportAttachment = (fieldName) => {
    return MulterMethods.multiple(fieldName, supportAttachmentFolderName);
};

exports.deleteSupportAttachment = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, supportAttachmentFolderName);
};


// Media Post ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getMediaPost = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + mediaPostFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};

exports.storeMediaPost = (fieldName) => {
    return MulterMethods.multiple(fieldName, mediaPostFolderName, 'image-video');
};

exports.storeMediaPostMany = (imageNames) => {
    return MulterMethods.many(imageNames, mediaPostFolderName, 'attachments');
};

exports.deleteMediaPost = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, mediaPostFolderName);
};

// Advertisement ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getAdvertisement = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + advertisementFolderName + '/' + image : '';
    // let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl, 1) + advertisementFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};

exports.storeAdvertisement = (imageNames) => {
    return MulterMethods.many(imageNames, advertisementFolderName, {});
};

exports.deleteAdvertisement = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, advertisementFolderName);
};

// Config Media ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getConfigMedia = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + configMediaFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};

exports.storeConfigMedia = () => {
    return MulterMethods.any(configMediaFolderName);
};

exports.deleteConfigMedia = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, configMediaFolderName);
};


// Card Attachment ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getCardAttachment = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + cardAttachmentFolderName + '/' + image : '';
    // let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl, 1) + cardAttachmentFolderName + '/' + image : '';
    return returnImage;// ? returnImage : getDefaultImage('user-profile.png', isFullUrl);
};

exports.storeCardAttachment = (imageNames) => {
    return MulterMethods.many(imageNames, cardAttachmentFolderName, { });
    // return MulterMethods.many(imageNames, cardAttachmentFolderName, { }, 1);
};

exports.deleteCardAttachment = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, cardAttachmentFolderName);
};


// ExchangeOwnership Attachment ||||||||||||||||||||||||||||||||||||||||||||||||
exports.getExchangeOwnershipAttachment = (image, isFullUrl = 1, isDefault = 0) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + exchangeOwnershipAttachmentFolderName + '/' + image : '';
    // let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl, 1) + exchangeOwnershipAttachmentFolderName + '/' + image : '';
    return returnImage;// ? returnImage : getDefaultImage('user-profile.png', isFullUrl);
};

exports.storeExchangeOwnershipAttachment = (fieldName) => {
    return MulterMethods.single(fieldName, exchangeOwnershipAttachmentFolderName);
};

/*exports.storeExchangeOwnershipAttachment = (imageNames) => {
    return MulterMethods.many(imageNames, exchangeOwnershipAttachmentFolderName);
    // return MulterMethods.many(imageNames, exchangeOwnershipAttachmentFolderName, { }, 1);
};*/

exports.deleteExchangeOwnershipAttachment = (imageNames) => {
    return MulterMethods.unlinkMediaMultiple(imageNames, exchangeOwnershipAttachmentFolderName);
};

exports.storeBadgeImage = (fieldName) => {
    return MulterMethods.single(fieldName, badgeFolderName);
};

exports.getBadgeImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + badgeFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};


exports.getGiftImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + giftFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};

exports.getNewIfcGiftImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + newIfcGiftFolderName + '/' + image : '';
    return returnImage ? returnImage : '';
};

exports.getPerformanceMeterImage = (image, isFullUrl = 1, isDefault = 1) => {
    let returnImage = image ? MulterMethods.getBaseUrl(isFullUrl) + performanceMeterName + '/' + image : '';
    return returnImage ? returnImage : '';
};