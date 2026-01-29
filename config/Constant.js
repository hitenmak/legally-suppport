require('dotenv').config();
const moment = require('moment');
const path = require('path');

// const getDate = (days) => moment().add(days, 'days');
// -------------------------------------------------------------------------------------------------

const ticketRequestType = {
    OTHERS: 'Others',
    ACCOUNT: 'Account',
    COMPLAINT: 'Complaint'
}
// question types :  text, dropdown, datetime, file, date, checkbox, textarea
const questions = {
    "ORDERS-AND-PAYMENTS": [
        {
            "key": "ORDER-ID",
            "label": "Order ID",
            "type": "text"
        },
        {
            "key": "EXPERIENCED-ISSUE",
            "label": "What issue are you experiencing?",
            "type": "dropdown"
        },
        {
            "key": "PAYMENT-METHOD",
            "label": "Payment method used",
            "type": "text"
        },
        {
            "key": "TRANSACTION-DATETIME",
            "label": "Date & time of transaction",
            "type": "datetime"
        },
        {
            "key": "PAYMENT-SCREENSHOT",
            "label": "Screenshot of payment (optional but recommended)",
            "type": "file",
            "optional": true
        }
    ],
    "PRODUCT-OR-LISTING-ISSUES": [
        {
            "key": "PRODUCT-NAME-LINK",
            "label": "Product name or link",
            "type": "text"
        },
        {
            "key": "SELLER-NAME",
            "label": "Seller name (if known)",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "What is the issue?",
            "type": "dropdown",
            "options": [
                { "key": "WRONG-ITEM", "value": "Wrong item" },
                { "key": "NOT-AS-DESCRIBED", "value": "Not as described" },
                { "key": "PRICING-MISMATCH", "value": "Pricing mismatch" }
            ]
        },
        {
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload photo/video evidence",
            "type": "file",
            "optional": true
        }
    ],

    "SELLER-ISSUES-BUYER-SIDE": [
        {
            "key": "SELLER-NAME",
            "label": "Seller name",
            "type": "text"
        },
        {
            "key": "ORDER-ID",
            "label": "Order ID",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "SELLER-NOT-RESPONDING", "value": "Seller not responding" },
                { "key": "SELLER-DELAYED-ORDER", "value": "Seller delayed order" },
                { "key": "SELLER-CANCELLED-ORDER", "value": "Seller cancelled order" }
            ]
        },
        {
            "key": "LAST-COMMUNICATION-DATE",
            "label": "Last communication date",
            "type": "date"
        }
    ],
    "SELLER-ACCOUNT-ISSUES-SELLER-SIDE": [
        {
            "key": "SELLER-ID-EMAIL",
            "label": "Seller ID / registered email",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "CANNOT-LOG-IN", "value": "Cannot log in" },
                { "key": "LISTING-APPROVAL-DELAY", "value": "Listing approval delay" },
                { "key": "STORE-RESTRICTED", "value": "Store restricted" }
            ]
        },
        {
            "key": "SCREENSHOT",
            "label": "Screenshot (if applicable)",
            "type": "file",
            "optional": true
        }
    ],
    "RETURNS-AND-REFUNDS-AND-DISPUTES": [
        [
            {
                "key": "ORDER-ID",
                "label": "Order ID",
                "type": "text",
            },
            {
                "key": "RETURN-REASON",
                "label": "Reason for return/refund",
                "type": "text",
            },
            {
                "key": "ITEM-RETURNED",
                "label": "Has item been returned?",
                "type": "checkbox",
            },
            {
                "key": "BANK-DETAILS",
                "label": "Bank details (if refund is approved)",
                "type": "text",
                "optional": true
            }
        ]
    ],
    "PROMOTIONS-AND-CAMPAIGNS": [
        {
            "key": "PROMO-CODE",
            "label": "Promo code used",
            "type": "text"
        },
        {
            "key": "PROMO-SOURCE",
            "label": "Where did you see the promo?",
            "type": "text"
        },
        {
            "key": "ERROR-SCREENSHOT",
            "label": "Screenshot of error message",
            "type": "file",
            "optional": true
        }
    ],
    "PICKUP-ISSUES": [
        {
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "text"
        },
        {
            "key": "PICKUP-ADDRESS",
            "label": "Pick-up address",
            "type": "text"
        },
        {
            "key": "PICKUP-DATETIME",
            "label": "Scheduled pick-up date/time",
            "type": "datetime"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "RIDER-NOT-SHOW", "value": "Rider did not show" },
                { "key": "PICKUP-DELAYED", "value": "Pick-up delayed" }
            ]
        },
        {
            "key": "PARCEL-SHOP",
            "label": "Parcel shop (if applicable)",
            "type": "text",
            "optional": true
        }
    ],
    "DELIVERY-OR-DROP-OFF-ISSUES": [
        {
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "text"
        },
        {
            "key": "DELIVERY-ADDRESS",
            "label": "Delivery address",
            "type": "text"
        },
        {
            "key": "CURRENT-STATUS",
            "label": "Current status shown in app",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "DELAYED", "value": "Delayed" },
                { "key": "FAILED-DELIVERY", "value": "Failed delivery" },
                { "key": "WRONG-ADDRESS", "value": "Wrong address" }
            ]
        },
        {
            "key": "CONTACT-PHONE-NUMBER",
            "label": "Contact phone number",
            "type": "text"
        }
    ],
    "PARCEL-DAMAGE-OR-LOSS": [
        {
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "text"
        },
        {
            "key": "DATE-LAST-SEEN",
            "label": "Date last seen",
            "type": "date"
        },
        {
            "key": "ISSUE-NATURE",
            "label": "Nature of issue",
            "type": "dropdown",
            "options": [
                { "key": "DAMAGED", "value": "Damaged" },
                { "key": "MISSING", "value": "Missing" }
            ]
        },
        {
            "key": "PHOTO-EVIDENCE",
            "label": "Upload photo evidence (mandatory)",
            "type": "file"
        },
        {
            "key": "ITEM-VALUE",
            "label": "Estimated item value",
            "type": "text"
        }
    ],
    "TRACKING-AND-STATUS-ISSUES": [
        {
            "key": "PARCEL-ORDER-ID",
            "label": "Parcel or Order ID",
            "type": "text"
        },
        {
            "key": "INCORRECT-STATUS",
            "label": "What status is incorrect?",
            "type": "text"
        },
        {
            "key": "TRACKING-SCREENSHOT",
            "label": "Screenshot of tracking screen",
            "type": "file",
            "optional": true
        }
    ],
    "SERVICE-BOOKING-ISSUES": [
        {
            "key": "BOOKING-ID",
            "label": "Booking ID",
            "type": "text"
        },
        {
            "key": "SERVICE-PROVIDER-NAME",
            "label": "Service provider name",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "NO-SHOW", "value": "No-show" },
                { "key": "POOR-SERVICE", "value": "Poor service" }
            ]
        },
        {
            "key": "SERVICE-DATE",
            "label": "Scheduled service date",
            "type": "date"
        }
    ],
    "RENTAL-ISSUES": [
        {
            "key": "RENTAL-ID",
            "label": "Rental ID",
            "type": "text"
        },
        {
            "key": "ITEM-NAME",
            "label": "Item name",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "LATE-RETURN", "value": "Late return" },
                { "key": "DAMAGE-DISPUTE", "value": "Damage dispute" }
            ]
        },
        {
            "key": "PHOTO-EVIDENCE",
            "label": "Photo evidence (if any)",
            "type": "file",
            "optional": true
        }
    ],
    "LOGIN-ISSUES": [
        {
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "text"
        },
        {
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "text"
        },
        {
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "dropdown",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "key": "APP-VERSION",
            "label": "App version",
            "type": "text"
        },
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "text"
        },
        {
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "file",
            "optional": true
        }
    ],
    "SELLER-ACCOUNT-RESTRICTIONS": [
        {
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "text"
        },
        {
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "text"
        },
        {
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "dropdown",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "key": "APP-VERSION",
            "label": "App version",
            "type": "text"
        },
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "text"
        },
        {
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "file",
            "optional": true
        }
    ],
    "LISTING-APPROVAL-DELAYS": [
        {
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "text"
        },
        {
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "text"
        },
        {
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "dropdown",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "key": "APP-VERSION",
            "label": "App version",
            "type": "text"
        },
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "text"
        },
        {
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "file",
            "optional": true
        }
    ],
    "APP-BUGS-OR-ERRORS": [
        {
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "text"
        },
        {
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "text"
        },
        {
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "dropdown",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "key": "APP-VERSION",
            "label": "App version",
            "type": "text"
        },
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "text"
        },
        {
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "file",
            "optional": true
        }
    ],
    "SUE-LEGAL-SERVICES": [
        {
            "key": "CASE-ID",
            "label": "Case ID",
            "type": "text"
        },
        {
            "key": "LAWYER-NAME",
            "label": "Lawyer name",
            "type": "text"
        },
        {
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "dropdown",
            "options": [
                { "key": "PAYMENT-ISSUE", "value": "Payment issue" },
                { "key": "CASE-DELAY", "value": "Case delay" }
            ]
        },
        {
            "key": "CONFIDENTIAL-NOTE",
            "label": "Confidential note section",
            "type": "textarea"
        }
    ],
    "COMPLAINT": [
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "textarea"
        },
        {
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "file",
            "optional": true
        }
    ],
    "SUGGESTION": [
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "textarea"
        },
        {
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "file",
            "optional": true
        }
    ],
    "FRAUD-OR-ABUSE-REPORT": [
        {
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "textarea"
        },
        {
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "file",
            "optional": true
        }
    ]
}

module.exports = {
    ROOT_DIR: path.join(process.cwd(), 'public'),

    STORAGE: {
        IS_LOCAL: true,
        LOCAL_FOLDER: 'public/storage',
        MAX_FILE_SIZE_MB: 50,
    },

    
    ticketRequestType,
    ticketRequestTypeKeys: Object.keys(ticketRequestType),

    questions,
    questionKeys: Object.keys(questions),
}