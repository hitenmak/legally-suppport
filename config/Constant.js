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
// question types :  TEXT, DROPDOWN, DATETIME, FILE, DATE, CHECKBOX, TEXTAREA
const questionTypes = ['TEXT', 'DROPDOWN', 'DATETIME', 'FILE', 'DATE', 'CHECKBOX', 'TEXTAREA'];
const questions = {
    "ORDERS-AND-PAYMENTS": [
        {
            "_id": "698047c0eff319a2960a4160",
            "key": "ORDER-ID",
            "label": "Order ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4161",
            "key": "EXPERIENCED-ISSUE",
            "label": "What issue are you experiencing?",
            "type": "DROPDOWN",
            "options": [
                { "key": "ORDER-NOT-CONFIRMED", "value": "Order not confirmed" },
                { "key": "PAYMENT-DEDUCTED-NO-ORDER", "value": "Payment deducted, but order not placed" },
                { "key": "REFUND-NOT-RECEIVED", "value": "Refund not received" },
                { "key": "INCORRECT-CHARGES", "value": "Incorrect charges" },
                { "key": "ESCROW-ISSUES", "value": "Escrow-related issues" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4162",
            "key": "PAYMENT-METHOD",
            "label": "Payment method used",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4163",
            "key": "TRANSACTION-DATETIME",
            "label": "Date & time of transaction",
            "type": "DATETIME"
        },
        {
            "_id": "698047c0eff319a2960a4164",
            "key": "PAYMENT-SCREENSHOT",
            "label": "Screenshot of payment (optional but recommended)",
            "type": "FILE",
            "optional": true
        }
    ],
    "PRODUCT-OR-LISTING-ISSUES": [
        {
            "_id": "698047c0eff319a2960a4165",
            "key": "PRODUCT-NAME-LINK",
            "label": "Product name or link",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4166",
            "key": "SELLER-NAME",
            "label": "Seller name (if known)",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4167",
            "key": "ISSUE-TYPE",
            "label": "What is the issue?",
            "type": "DROPDOWN",
            "options": [
                { "key": "WRONG-ITEM", "value": "Wrong item" },
                { "key": "NOT-AS-DESCRIBED", "value": "Not as described" },
                { "key": "PRICING-MISMATCH", "value": "Pricing mismatch" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4168",
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload photo/video evidence",
            "type": "FILE",
            "optional": true
        }
    ],

    "SELLER-ISSUES-BUYER-SIDE": [
        {
            "_id": "698047c0eff319a2960a4169",
            "key": "SELLER-NAME",
            "label": "Seller name",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a416a",
            "key": "ORDER-ID",
            "label": "Order ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a416b",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "SELLER-NOT-RESPONDING", "value": "Seller not responding" },
                { "key": "SELLER-DELAYED-ORDER", "value": "Seller delayed order" },
                { "key": "SELLER-CANCELLED-ORDER", "value": "Seller cancelled order" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a416c",
            "key": "LAST-COMMUNICATION-DATE",
            "label": "Last communication date",
            "type": "DATE"
        }
    ],
    "SELLER-ACCOUNT-ISSUES-SELLER-SIDE": [
        {
            "_id": "698047c0eff319a2960a416d",
            "key": "SELLER-ID-EMAIL",
            "label": "Seller ID / registered email",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a416e",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "CANNOT-LOG-IN", "value": "Cannot log in" },
                { "key": "LISTING-APPROVAL-DELAY", "value": "Listing approval delay" },
                { "key": "STORE-RESTRICTED", "value": "Store restricted" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a416f",
            "key": "SCREENSHOT",
            "label": "Screenshot (if applicable)",
            "type": "FILE",
            "optional": true
        }
    ],
    "RETURNS-AND-REFUNDS-AND-DISPUTES": [
        [
            {
                "_id": "698047c0eff319a2960a4170",
                "key": "ORDER-ID",
                "label": "Order ID",
                "type": "TEXT",
            },
            {
                "_id": "698047c0eff319a2960a4171",
                "key": "RETURN-REASON",
                "label": "Reason for return/refund",
                "type": "TEXT",
            },
            {
                "_id": "698047c0eff319a2960a4172",
                "key": "ITEM-RETURNED",
                "label": "Has item been returned?",
                "type": "CHECKBOX",
            },
            {
                "_id": "698047c0eff319a2960a4173",
                "key": "BANK-DETAILS",
                "label": "Bank details (if refund is approved)",
                "type": "TEXT",
                "optional": true
            }
        ]
    ],
    "PROMOTIONS-AND-CAMPAIGNS": [
        {
            "_id": "698047c0eff319a2960a4174",
            "key": "PROMO-CODE",
            "label": "Promo code used",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4175",
            "key": "PROMO-SOURCE",
            "label": "Where did you see the promo?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4176",
            "key": "ERROR-SCREENSHOT",
            "label": "Screenshot of error message",
            "type": "FILE",
            "optional": true
        }
    ],
    "PICKUP-ISSUES": [
        {
            "_id": "698047c0eff319a2960a4177",
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4178",
            "key": "PICKUP-ADDRESS",
            "label": "Pick-up address",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4179",
            "key": "PICKUP-DATETIME",
            "label": "Scheduled pick-up date/time",
            "type": "DATETIME"
        },
        {
            "_id": "698047c0eff319a2960a417a",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "RIDER-NOT-SHOW", "value": "Rider did not show" },
                { "key": "PICKUP-DELAYED", "value": "Pick-up delayed" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a417b",
            "key": "PARCEL-SHOP",
            "label": "Parcel shop (if applicable)",
            "type": "TEXT",
            "optional": true
        }
    ],
    "DELIVERY-OR-DROP-OFF-ISSUES": [
        {
            "_id": "698047c0eff319a2960a417c",
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a417d",
            "key": "DELIVERY-ADDRESS",
            "label": "Delivery address",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a417e",
            "key": "CURRENT-STATUS",
            "label": "Current status shown in app",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a417f",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "DELAYED", "value": "Delayed" },
                { "key": "FAILED-DELIVERY", "value": "Failed delivery" },
                { "key": "WRONG-ADDRESS", "value": "Wrong address" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4180",
            "key": "CONTACT-PHONE-NUMBER",
            "label": "Contact phone number",
            "type": "TEXT"
        }
    ],
    "PARCEL-DAMAGE-OR-LOSS": [
        {
            "_id": "698047c0eff319a2960a4181",
            "key": "PARCEL-ID",
            "label": "Parcel ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4182",
            "key": "DATE-LAST-SEEN",
            "label": "Date last seen",
            "type": "DATE"
        },
        {
            "_id": "698047c0eff319a2960a4183",
            "key": "ISSUE-NATURE",
            "label": "Nature of issue",
            "type": "DROPDOWN",
            "options": [
                { "key": "DAMAGED", "value": "Damaged" },
                { "key": "MISSING", "value": "Missing" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4184",
            "key": "PHOTO-EVIDENCE",
            "label": "Upload photo evidence (mandatory)",
            "type": "FILE"
        },
        {
            "_id": "698047c0eff319a2960a4185",
            "key": "ITEM-VALUE",
            "label": "Estimated item value",
            "type": "TEXT"
        }
    ],
    "TRACKING-AND-STATUS-ISSUES": [
        {
            "_id": "698047c0eff319a2960a4186",
            "key": "PARCEL-ORDER-ID",
            "label": "Parcel or Order ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4187",
            "key": "INCORRECT-STATUS",
            "label": "What status is incorrect?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4188",
            "key": "TRACKING-SCREENSHOT",
            "label": "Screenshot of tracking screen",
            "type": "FILE",
            "optional": true
        }
    ],
    "SERVICE-BOOKING-ISSUES": [
        {
            "_id": "698047c0eff319a2960a4189",
            "key": "BOOKING-ID",
            "label": "Booking ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a418a",
            "key": "SERVICE-PROVIDER-NAME",
            "label": "Service provider name",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a418b",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "NO-SHOW", "value": "No-show" },
                { "key": "POOR-SERVICE", "value": "Poor service" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a418c",
            "key": "SERVICE-DATE",
            "label": "Scheduled service date",
            "type": "DATE"
        }
    ],
    "RENTAL-ISSUES": [
        {
            "_id": "698047c0eff319a2960a418d",
            "key": "RENTAL-ID",
            "label": "Rental ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a418e",
            "key": "ITEM-NAME",
            "label": "Item name",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a418f",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "LATE-RETURN", "value": "Late return" },
                { "key": "DAMAGE-DISPUTE", "value": "Damage dispute" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4190",
            "key": "PHOTO-EVIDENCE",
            "label": "Photo evidence (if any)",
            "type": "FILE",
            "optional": true
        }
    ],
    "LOGIN-ISSUES": [
        {
            "_id": "698047c0eff319a2960a4191",
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4192",
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4193",
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "DROPDOWN",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a4194",
            "key": "APP-VERSION",
            "label": "App version",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4195",
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4196",
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "FILE",
            "optional": true
        }
    ],
    "SELLER-ACCOUNT-RESTRICTIONS": [
        {
            "_id": "698047c0eff319a2960a4197",
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4198",
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a4199",
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "DROPDOWN",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a419a",
            "key": "APP-VERSION",
            "label": "App version",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a419b",
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a419c",
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "FILE",
            "optional": true
        }
    ],
    "LISTING-APPROVAL-DELAYS": [
        {
            "_id": "698047c0eff319a2960a419d",
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a419e",
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a419f",
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "DROPDOWN",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a41a0",
            "key": "APP-VERSION",
            "label": "App version",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a1",
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a2",
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "FILE",
            "optional": true
        }
    ],
    "APP-BUGS-OR-ERRORS": [
        {
            "_id": "698047c0eff319a2960a41a3",
            "key": "ISSUE-TITLE",
            "label": "What issues are you experiencing?",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a4",
            "key": "REGISTERED-EMAIL-SELLER-ID",
            "label": "Registered email or Seller ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a5",
            "key": "DEVICE-TYPE",
            "label": "Device type",
            "type": "DROPDOWN",
            "options": [
                { "key": "ANDROID", "value": "Android" },
                { "key": "IOS", "value": "iOS" },
                { "key": "WEB", "value": "Web" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a41a6",
            "key": "APP-VERSION",
            "label": "App version",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a7",
            "key": "ISSUE-DESCRIPTION",
            "label": "Issue description",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41a8",
            "key": "SCREENSHOT-RECORDING",
            "label": "Screenshot or screen recording",
            "type": "FILE",
            "optional": true
        }
    ],
    "SUE-LEGAL-SERVICES": [
        {
            "_id": "698047c0eff319a2960a41a9",
            "key": "CASE-ID",
            "label": "Case ID",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41aa",
            "key": "LAWYER-NAME",
            "label": "Lawyer name",
            "type": "TEXT"
        },
        {
            "_id": "698047c0eff319a2960a41ab",
            "key": "ISSUE-TYPE",
            "label": "Issue type",
            "type": "DROPDOWN",
            "options": [
                { "key": "PAYMENT-ISSUE", "value": "Payment issue" },
                { "key": "CASE-DELAY", "value": "Case delay" }
            ]
        },
        {
            "_id": "698047c0eff319a2960a41ac",
            "key": "CONFIDENTIAL-NOTE",
            "label": "Confidential note section",
            "type": "TEXTAREA"
        }
    ],
    "COMPLAINT": [
        {
            "_id": "698047c0eff319a2960a41ad",
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "TEXTAREA"
        },
        {
            "_id": "698047c0eff319a2960a41ae",
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "FILE",
            "optional": true
        }
    ],
    "SUGGESTION": [
        {
            "_id": "698047c0eff319a2960a41af",
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "TEXTAREA"
        },
        {
            "_id": "698047c0eff319a2960a41b0",
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "FILE",
            "optional": true
        }
    ],
    "FRAUD-OR-ABUSE-REPORT": [
        {
            "_id": "698047c0eff319a2960a41b1",
            "key": "ISSUE-DESCRIPTION",
            "label": "Describe the issue",
            "type": "TEXTAREA"
        },
        {
            "_id": "698047c0eff319a2960a41b2",
            "key": "EVIDENCE-UPLOAD",
            "label": "Upload evidence (if fraud)",
            "type": "FILE",
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

    userType: ["Admin", "User"],

    ticketRequestType,
    ticketRequestTypeKeys: Object.keys(ticketRequestType),

    questions,
    questionKeys: Object.keys(questions),
    questionTypes
}