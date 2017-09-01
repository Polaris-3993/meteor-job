import { Countries } from '/imports/api/countries/countries';
import { JobCategories } from '/imports/api/jobCategories/jobCategories';
import { JobPerks } from '/imports/api/jobPerks/jobPerks';
import { JobTypes } from '/imports/api/jobTypes/jobTypes';
import { Skills } from '/imports/api/skills/skills';

Meteor.startup(function () {
    fillCollectionsWithDefaultData();

});

var fillCollectionsWithDefaultData = function () {
    // if (JobCategories.find().count() <= 0) {
    //     var categoriesArray = [{
    //         label: 'Design'
    //     }, {
    //         label: 'Infosec'
    //     }, {
    //         label: 'Finance'
    //     }, {
    //         label: 'Legal'
    //     }, {
    //         label: 'Management'
    //     }, {
    //         label: 'Sales & Marketing'
    //     }, {
    //         label: 'Software Development'
    //     }, {
    //         label: 'Testing & QA'
    //     }, {
    //         label: 'Support'
    //     }, {
    //         label: 'Video/audio Production'
    //     }, {
    //         label: 'Writing & Translation'
    //     }];
    //
    //     categoriesArray.forEach(function (categoryObj) {
    //         JobCategories.insert(categoryObj);
    //     });
    //
    //     console.log('Default job categories added to DB');
    //     console.log('\n\n');
    // }
    //
    // if (JobTypes.find().count() <= 0) {
    //     var typesArray = ['Full-time', 'Part-time', 'Freelance', 'Moonlighting', 'Internship'];
    //
    //     _.each(typesArray, function (item) {
    //         JobTypes.insert({label: item});
    //     });
    //
    //     console.log('Default job types added to DB');
    //     console.log('\n\n');
    // }
    //
    // if (JobPerks.find().count() <= 0) {
    //     var perksArray = ['Visa', 'Relocation', 'Equity'];
    //
    //     _.each(perksArray, function (item) {
    //         JobPerks.insert({label: item});
    //     });
    //
    //     console.log('Default job perks added to DB');
    //     console.log('\n\n');
    // }
    //
    // if (Skills.find().count() <= 0) {
    //     var skills = {
    //         Design: ['Design', 'UI', 'UX', 'Illustrator', 'Animator', 'Bootstrap', 'Indesign', 'Flash'],
    //         Infosec: ['Infosec', 'Devops', 'SQL', 'Database Admin', 'Network Admin'],
    //         Finance: ['Finance', 'Accounting', 'Bookkeeping', 'Budgeting and Forecasting',
    //             'Finance Planning', 'Reporting and Analysis'],
    //         Legal: ['Legal', 'Contract Law', 'Corporate Law', 'Criminal Law', 'Family Law',
    //             'Intellectual Property Law', 'Paralegal Services'],
    //         Management: ['Management'],
    //         'Sales & Marketing': ['Sales', 'Advertising Consultants', 'Brand Strategists', 'Cold Callers', 'Direct Marketers',
    //             'Email Marketing Consultants', 'Google Adwords Experts', 'Google Analytics Consultants',
    //             'Google Website Optimizer Consultants', 'Lead Generation Specialists', 'Link Builders',
    //             'Market Researchers', 'Marketing Strategists', 'On-page Optimization', 'Outbound Sales Consultants',
    //             'SME Specialists', 'PPC Specialists', 'SEO Expert'],
    //         'Software Development': ['Dev', 'Frontend', 'Backend', 'Full Stack', 'Mobile Dev', 'Game Dev', 'Desktop Dev', 'SQL'],
    //         'Testing & QA': ['Testing', 'Unit Testing', 'Automation Testing', 'Regression Testing', 'A/b Testing',
    //             'Black Box Testing', 'Load Testing', 'Performance Testing', 'User Acceptance Testing',
    //             'Mobile App Testing', 'Usability Testing'],
    //         Support: ['Support', 'Administrative Support Assistant', 'Help Desk Support Contractors',
    //             'Technical Support Assistant'],
    //         'Video/audio Production': ['Video/audio', 'Video Editor', 'Video Producer', 'Voice Actor'],
    //         'Writing & Translation': ['Writing & Translation', 'General Translation', 'Legal Translation', 'Medical Translation',
    //             'Technical Translation']
    //     };
    //
    //     _.each(skills, function (skills, categoryLabel) {
    //         var jobCategory = JobCategories.findOne({label: categoryLabel});
    //
    //         if (jobCategory) {
    //             // first skill in array is required
    //             skills.forEach(function (skillLabel, number) {
    //                 var skillObj = {
    //                     label: skillLabel,
    //                     relatedJobCategoryId: jobCategory._id,
    //                     isRequired: number == 0
    //                 };
    //                 Skills.insert(skillObj);
    //             });
    //         } else {
    //             console.log('no such jobCategory: ' + categoryLabel);
    //         }
    //     });
    //
    //     console.log('Default job skills added to DB');
    //     console.log('\n\n');
    // }

    if (Countries.find().count() <= 0) {
        _.each(countriesList, function (item) {
            Countries.insert(item);
        });

        console.log('Counties list added to DB');
        console.log('\n\n');
    }
};

var countriesList = [{
    "countryCode": "US",
    "label": "United States of America"
}, {
    "countryCode": "GB",
    "label": "United Kingdom of Great Britain and Northern Ireland"
}, {
    "countryCode": "AD",
    "label": "Andorra"
}, {
    "countryCode": "AE",
    "label": "United Arab Emirates"
}, {
    "countryCode": "AF",
    "label": "Afghanistan"
}, {
    "countryCode": "AG",
    "label": "Antigua and Barbuda"
}, {
    "countryCode": "AI",
    "label": "Anguilla"
}, {
    "countryCode": "AL",
    "label": "Albania"
}, {
    "countryCode": "AM",
    "label": "Armenia"
}, {
    "countryCode": "AO",
    "label": "Angola"
}, {
    "countryCode": "AQ",
    "label": "Antarctica"
}, {
    "countryCode": "AR",
    "label": "Argentina"
}, {
    "countryCode": "AS",
    "label": "American Samoa"
}, {
    "countryCode": "AT",
    "label": "Austria"
}, {
    "countryCode": "AU",
    "label": "Australia"
}, {
    "countryCode": "AW",
    "label": "Aruba"
}, {
    "countryCode": "AX",
    "label": "Åland Islands"
}, {
    "countryCode": "AZ",
    "label": "Azerbaijan"
}, {
    "countryCode": "BA",
    "label": "Bosnia and Herzegovina"
}, {
    "countryCode": "BB",
    "label": "Barbados"
}, {
    "countryCode": "BD",
    "label": "Bangladesh"
}, {
    "countryCode": "BE",
    "label": "Belgium"
}, {
    "countryCode": "BF",
    "label": "Burkina Faso"
}, {
    "countryCode": "BG",
    "label": "Bulgaria"
}, {
    "countryCode": "BH",
    "label": "Bahrain"
}, {
    "countryCode": "BI",
    "label": "Burundi"
}, {
    "countryCode": "BJ",
    "label": "Benin"
}, {
    "countryCode": "BL",
    "label": "Saint Barthélemy"
}, {
    "countryCode": "BM",
    "label": "Bermuda"
}, {
    "countryCode": "BN",
    "label": "Brunei Darussalam"
}, {
    "countryCode": "BO",
    "label": "Bolivia, Plurinational State of"
}, {
    "countryCode": "BQ",
    "label": "Bonaire, Sint Eustatius and Saba"
}, {
    "countryCode": "BR",
    "label": "Brazil"
}, {
    "countryCode": "BS",
    "label": "Bahamas"
}, {
    "countryCode": "BT",
    "label": "Bhutan"
}, {
    "countryCode": "BV",
    "label": "Bouvet Island"
}, {
    "countryCode": "BW",
    "label": "Botswana"
}, {
    "countryCode": "BY",
    "label": "Belarus"
}, {
    "countryCode": "BZ",
    "label": "Belize"
}, {
    "countryCode": "CA",
    "label": "Canada"
}, {
    "countryCode": "CC",
    "label": "Cocos (Keeling) Islands"
}, {
    "countryCode": "CD",
    "label": "Congo, the Democratic Republic of the"
}, {
    "countryCode": "CF",
    "label": "Central African Republic"
}, {
    "countryCode": "CG",
    "label": "Congo"
}, {
    "countryCode": "CH",
    "label": "Switzerland"
}, {
    "countryCode": "CI",
    "label": "Côte d'Ivoire"
}, {
    "countryCode": "CK",
    "label": "Cook Islands"
}, {
    "countryCode": "CL",
    "label": "Chile"
}, {
    "countryCode": "CM",
    "label": "Cameroon"
}, {
    "countryCode": "CN",
    "label": "China"
}, {
    "countryCode": "CO",
    "label": "Colombia"
}, {
    "countryCode": "CR",
    "label": "Costa Rica"
}, {
    "countryCode": "CU",
    "label": "Cuba"
}, {
    "countryCode": "CV",
    "label": "Cabo Verde"
}, {
    "countryCode": "CW",
    "label": "Curaçao"
}, {
    "countryCode": "CX",
    "label": "Christmas Island"
}, {
    "countryCode": "CY",
    "label": "Cyprus"
}, {
    "countryCode": "CZ",
    "label": "Czech Republic"
}, {
    "countryCode": "DE",
    "label": "Germany"
}, {
    "countryCode": "DJ",
    "label": "Djibouti"
}, {
    "countryCode": "DK",
    "label": "Denmark"
}, {
    "countryCode": "DM",
    "label": "Dominica"
}, {
    "countryCode": "DO",
    "label": "Dominican Republic"
}, {
    "countryCode": "DZ",
    "label": "Algeria"
}, {
    "countryCode": "EC",
    "label": "Ecuador"
}, {
    "countryCode": "EE",
    "label": "Estonia"
}, {
    "countryCode": "EG",
    "label": "Egypt"
}, {
    "countryCode": "EH",
    "label": "Western Sahara"
}, {
    "countryCode": "ER",
    "label": "Eritrea"
}, {
    "countryCode": "ES",
    "label": "Spain"
}, {
    "countryCode": "ET",
    "label": "Ethiopia"
}, {
    "countryCode": "FI",
    "label": "Finland"
}, {
    "countryCode": "FJ",
    "label": "Fiji"
}, {
    "countryCode": "FK",
    "label": "Falkland Islands (Malvinas)"
}, {
    "countryCode": "FM",
    "label": "Micronesia, Federated States of"
}, {
    "countryCode": "FO",
    "label": "Faroe Islands"
}, {
    "countryCode": "FR",
    "label": "France"
}, {
    "countryCode": "GA",
    "label": "Gabon"
}, {
    "countryCode": "GD",
    "label": "Grenada"
}, {
    "countryCode": "GE",
    "label": "Georgia"
}, {
    "countryCode": "GF",
    "label": "French Guiana"
}, {
    "countryCode": "GG",
    "label": "Guernsey"
}, {
    "countryCode": "GH",
    "label": "Ghana"
}, {
    "countryCode": "GI",
    "label": "Gibraltar"
}, {
    "countryCode": "GL",
    "label": "Greenland"
}, {
    "countryCode": "GM",
    "label": "Gambia"
}, {
    "countryCode": "GN",
    "label": "Guinea"
}, {
    "countryCode": "GP",
    "label": "Guadeloupe"
}, {
    "countryCode": "GQ",
    "label": "Equatorial Guinea"
}, {
    "countryCode": "GR",
    "label": "Greece"
}, {
    "countryCode": "GS",
    "label": "South Georgia and the South Sandwich Islands"
}, {
    "countryCode": "GT",
    "label": "Guatemala"
}, {
    "countryCode": "GU",
    "label": "Guam"
}, {
    "countryCode": "GW",
    "label": "Guinea-Bissau"
}, {
    "countryCode": "GY",
    "label": "Guyana"
}, {
    "countryCode": "HK",
    "label": "Hong Kong"
}, {
    "countryCode": "HM",
    "label": "Heard Island and McDonald Islands"
}, {
    "countryCode": "HN",
    "label": "Honduras"
}, {
    "countryCode": "HR",
    "label": "Croatia"
}, {
    "countryCode": "HT",
    "label": "Haiti"
}, {
    "countryCode": "HU",
    "label": "Hungary"
}, {
    "countryCode": "ID",
    "label": "Indonesia"
}, {
    "countryCode": "IE",
    "label": "Ireland"
}, {
    "countryCode": "IL",
    "label": "Israel"
}, {
    "countryCode": "IM",
    "label": "Isle of Man"
}, {
    "countryCode": "IN",
    "label": "India"
}, {
    "countryCode": "IO",
    "label": "British Indian Ocean Territory"
}, {
    "countryCode": "IQ",
    "label": "Iraq"
}, {
    "countryCode": "IR",
    "label": "Iran, Islamic Republic of"
}, {
    "countryCode": "IS",
    "label": "Iceland"
}, {
    "countryCode": "IT",
    "label": "Italy"
}, {
    "countryCode": "JE",
    "label": "Jersey"
}, {
    "countryCode": "JM",
    "label": "Jamaica"
}, {
    "countryCode": "JO",
    "label": "Jordan"
}, {
    "countryCode": "JP",
    "label": "Japan"
}, {
    "countryCode": "KE",
    "label": "Kenya"
}, {
    "countryCode": "KG",
    "label": "Kyrgyzstan"
}, {
    "countryCode": "KH",
    "label": "Cambodia"
}, {
    "countryCode": "KI",
    "label": "Kiribati"
}, {
    "countryCode": "KM",
    "label": "Comoros"
}, {
    "countryCode": "KN",
    "label": "Saint Kitts and Nevis"
}, {
    "countryCode": "KP",
    "label": "Korea, Democratic People's Republic of"
}, {
    "countryCode": "KR",
    "label": "Korea, Republic of"
}, {
    "countryCode": "KW",
    "label": "Kuwait"
}, {
    "countryCode": "KY",
    "label": "Cayman Islands"
}, {
    "countryCode": "KZ",
    "label": "Kazakhstan"
}, {
    "countryCode": "LA",
    "label": "Lao People's Democratic Republic"
}, {
    "countryCode": "LB",
    "label": "Lebanon"
}, {
    "countryCode": "LC",
    "label": "Saint Lucia"
}, {
    "countryCode": "LI",
    "label": "Liechtenstein"
}, {
    "countryCode": "LK",
    "label": "Sri Lanka"
}, {
    "countryCode": "LR",
    "label": "Liberia"
}, {
    "countryCode": "LS",
    "label": "Lesotho"
}, {
    "countryCode": "LT",
    "label": "Lithuania"
}, {
    "countryCode": "LU",
    "label": "Luxembourg"
}, {
    "countryCode": "LV",
    "label": "Latvia"
}, {
    "countryCode": "LY",
    "label": "Libya"
}, {
    "countryCode": "MA",
    "label": "Morocco"
}, {
    "countryCode": "MC",
    "label": "Monaco"
}, {
    "countryCode": "MD",
    "label": "Moldova, Republic of"
}, {
    "countryCode": "ME",
    "label": "Montenegro"
}, {
    "countryCode": "MF",
    "label": "Saint Martin (French part)"
}, {
    "countryCode": "MG",
    "label": "Madagascar"
}, {
    "countryCode": "MH",
    "label": "Marshall Islands"
}, {
    "countryCode": "MK",
    "label": "Macedonia, the former Yugoslav Republic of"
}, {
    "countryCode": "ML",
    "label": "Mali"
}, {
    "countryCode": "MM",
    "label": "Myanmar"
}, {
    "countryCode": "MN",
    "label": "Mongolia"
}, {
    "countryCode": "MO",
    "label": "Macao"
}, {
    "countryCode": "MP",
    "label": "Northern Mariana Islands"
}, {
    "countryCode": "MQ",
    "label": "Martinique"
}, {
    "countryCode": "MR",
    "label": "Mauritania"
}, {
    "countryCode": "MS",
    "label": "Montserrat"
}, {
    "countryCode": "MT",
    "label": "Malta"
}, {
    "countryCode": "MU",
    "label": "Mauritius"
}, {
    "countryCode": "MV",
    "label": "Maldives"
}, {
    "countryCode": "MW",
    "label": "Malawi"
}, {
    "countryCode": "MX",
    "label": "Mexico"
}, {
    "countryCode": "MY",
    "label": "Malaysia"
}, {
    "countryCode": "MZ",
    "label": "Mozambique"
}, {
    "countryCode": "NA",
    "label": "Namibia"
}, {
    "countryCode": "NC",
    "label": "New Caledonia"
}, {
    "countryCode": "NE",
    "label": "Niger"
}, {
    "countryCode": "NF",
    "label": "Norfolk Island"
}, {
    "countryCode": "NG",
    "label": "Nigeria"
}, {
    "countryCode": "NI",
    "label": "Nicaragua"
}, {
    "countryCode": "NL",
    "label": "Netherlands"
}, {
    "countryCode": "NO",
    "label": "Norway"
}, {
    "countryCode": "NP",
    "label": "Nepal"
}, {
    "countryCode": "NR",
    "label": "Nauru"
}, {
    "countryCode": "NU",
    "label": "Niue"
}, {
    "countryCode": "NZ",
    "label": "New Zealand"
}, {
    "countryCode": "OM",
    "label": "Oman"
}, {
    "countryCode": "PA",
    "label": "Panama"
}, {
    "countryCode": "PE",
    "label": "Peru"
}, {
    "countryCode": "PF",
    "label": "French Polynesia"
}, {
    "countryCode": "PG",
    "label": "Papua New Guinea"
}, {
    "countryCode": "PH",
    "label": "Philippines"
}, {
    "countryCode": "PK",
    "label": "Pakistan"
}, {
    "countryCode": "PL",
    "label": "Poland"
}, {
    "countryCode": "PM",
    "label": "Saint Pierre and Miquelon"
}, {
    "countryCode": "PN",
    "label": "Pitcairn"
}, {
    "countryCode": "PR",
    "label": "Puerto Rico"
}, {
    "countryCode": "PS",
    "label": "Palestine, State of"
}, {
    "countryCode": "PT",
    "label": "Portugal"
}, {
    "countryCode": "PW",
    "label": "Palau"
}, {
    "countryCode": "PY",
    "label": "Paraguay"
}, {
    "countryCode": "QA",
    "label": "Qatar"
}, {
    "countryCode": "RE",
    "label": "Réunion"
}, {
    "countryCode": "RO",
    "label": "Romania"
}, {
    "countryCode": "RS",
    "label": "Serbia"
}, {
    "countryCode": "RU",
    "label": "Russian Federation"
}, {
    "countryCode": "RW",
    "label": "Rwanda"
}, {
    "countryCode": "SA",
    "label": "Saudi Arabia"
}, {
    "countryCode": "SB",
    "label": "Solomon Islands"
}, {
    "countryCode": "SC",
    "label": "Seychelles"
}, {
    "countryCode": "SD",
    "label": "Sudan"
}, {
    "countryCode": "SE",
    "label": "Sweden"
}, {
    "countryCode": "SG",
    "label": "Singapore"
}, {
    "countryCode": "SH",
    "label": "Saint Helena, Ascension and Tristan da Cunha"
}, {
    "countryCode": "SI",
    "label": "Slovenia"
}, {
    "countryCode": "SJ",
    "label": "Svalbard and Jan Mayen"
}, {
    "countryCode": "SK",
    "label": "Slovakia"
}, {
    "countryCode": "SL",
    "label": "Sierra Leone"
}, {
    "countryCode": "SM",
    "label": "San Marino"
}, {
    "countryCode": "SN",
    "label": "Senegal"
}, {
    "countryCode": "SO",
    "label": "Somalia"
}, {
    "countryCode": "SR",
    "label": "Suriname"
}, {
    "countryCode": "SS",
    "label": "South Sudan"
}, {
    "countryCode": "ST",
    "label": "Sao Tome and Principe"
}, {
    "countryCode": "SV",
    "label": "El Salvador"
}, {
    "countryCode": "SX",
    "label": "Sint Maarten (Dutch part)"
}, {
    "countryCode": "SY",
    "label": "Syrian Arab Republic"
}, {
    "countryCode": "SZ",
    "label": "Swaziland"
}, {
    "countryCode": "TC",
    "label": "Turks and Caicos Islands"
}, {
    "countryCode": "TD",
    "label": "Chad"
}, {
    "countryCode": "TF",
    "label": "French Southern Territories"
}, {
    "countryCode": "TG",
    "label": "Togo"
}, {
    "countryCode": "TH",
    "label": "Thailand"
}, {
    "countryCode": "TJ",
    "label": "Tajikistan"
}, {
    "countryCode": "TK",
    "label": "Tokelau"
}, {
    "countryCode": "TL",
    "label": "Timor-Leste"
}, {
    "countryCode": "TM",
    "label": "Turkmenistan"
}, {
    "countryCode": "TN",
    "label": "Tunisia"
}, {
    "countryCode": "TO",
    "label": "Tonga"
}, {
    "countryCode": "TR",
    "label": "Turkey"
}, {
    "countryCode": "TT",
    "label": "Trinidad and Tobago"
}, {
    "countryCode": "TV",
    "label": "Tuvalu"
}, {
    "countryCode": "TW",
    "label": "Taiwan, Province of China"
}, {
    "countryCode": "TZ",
    "label": "Tanzania, United Republic of"
}, {
    "countryCode": "UA",
    "label": "Ukraine"
}, {
    "countryCode": "UG",
    "label": "Uganda"
}, {
    "countryCode": "UM",
    "label": "United States Minor Outlying Islands"
}, {
    "countryCode": "UY",
    "label": "Uruguay"
}, {
    "countryCode": "UZ",
    "label": "Uzbekistan"
}, {
    "countryCode": "VA",
    "label": "Holy See"
}, {
    "countryCode": "VC",
    "label": "Saint Vincent and the Grenadines"
}, {
    "countryCode": "VE",
    "label": "Venezuela, Bolivarian Republic of"
}, {
    "countryCode": "VG",
    "label": "Virgin Islands, British"
}, {
    "countryCode": "VI",
    "label": "Virgin Islands, U.S."
}, {
    "countryCode": "VN",
    "label": "Viet Nam"
}, {
    "countryCode": "VU",
    "label": "Vanuatu"
}, {
    "countryCode": "WF",
    "label": "Wallis and Futuna"
}, {
    "countryCode": "WS",
    "label": "Samoa"
}, {
    "countryCode": "YE",
    "label": "Yemen"
}, {
    "countryCode": "YT",
    "label": "Mayotte"
}, {
    "countryCode": "ZA",
    "label": "South Africa"
}, {
    "countryCode": "ZM",
    "label": "Zambia"
}, {
    "countryCode": "ZW",
    "label": "Zimbabwe"
}];