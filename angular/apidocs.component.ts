import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';

/* ── Shared constants ───────────────────────────────────────── */
const REQ_HEADERS = [
  { name: 'x-request-id',       type: 'string', required: true, in: 'header', example: '00000000-1111-2222-3333-444444444444' },
  { name: 'x-request-datetime', type: 'string', required: true, in: 'header', example: 'Sun Jan 01 2023 00:00:00 GMT-0400' },
  { name: 'x-signature',        type: 'string', required: true, in: 'header', example: '5d9a5a3d8d27ce03234c70a90dde8c190dac0a6f2b1e7c4d' },
  { name: 'Authorization',      type: 'string', required: true, in: 'header', example: 'ApiKey sk_acc_9f2c81a4d7e6' },
];

const ACCOUNT_ID_PARAM = { name: 'accountId', type: 'string', required: true, in: 'path', example: '5590177a-31a1-4f58-8232-eeaa7a317c45' };

const RESP_HEADERS = [
  { name: 'x-request-id', type: 'string', description: 'A unique identifier meaningful to the caller. It is returned in the response so a caller using an asynchronous paradigm can use this id to complete the processing of the response.' },
  { name: 'x-signature',  type: 'string', description: "An HMAC-SHA256 of the content in the body of the response, signed with the caller's signing key." },
];

const BANK = { accountHolderFirstName: 'Jane', accountHolderLastName: 'Doe', accountNumber: '654321', accountType: 'S', bankName: 'chase', id: '5590177a-31a1-4f58-8232-eeaa7a317c45', isDomestic: true, routingNumber: '071000813' };
const ADDR = { addressType: '4', city: 'Newton', country: 'US', state: 'MA' };

const REQ_ENROLL: any = {
  enrollMethod: 'W', schema: 'urn:ascensus:529:1.0:account',
  'urn:ascensus:529:1.0:account': { banks: [BANK], beneficiaries: [{ accountType: 'R', addresses: [ADDR] }] }
};
const RES_ENROLL: any = {
  enrollMethod: 'W', metadata: {}, schema: 'urn:ascensus:529:1.0:account',
  'urn:ascensus:529:1.0:account': { banks: [BANK], beneficiaries: [{ accountNumber: '1234567890', accountType: 'R', addresses: [ADDR] }] }
};
const RES_400 = { metadata: {}, schema: 'urn:ascensus:529:1.0:account', 'urn:ascensus:529:1.0:account': { errors: [{ bindingFailure: false, defaultMessage: 'Error Message', field: 'Field', objectName: 'Object' }] } };
const RES_403 = { detail: 'Account web access is disabled', instance: '/account/', status: 403, title: 'Forbidden', type: 'about:blank' };
const RES_400_MULTI = {
  metadata: {}, schema: 'urn:ascensus:529:1.0:account',
  'urn:ascensus:529:1.0:account': { errors: [
    { bindingFailure: false, defaultMessage: 'Routing number is invalid', field: 'banks[0].routingNumber', objectName: 'bank' },
    { bindingFailure: false, defaultMessage: 'Beneficiary date of birth is required', field: 'beneficiaries[0].dateOfBirth', objectName: 'beneficiary' },
    { bindingFailure: true,  defaultMessage: 'Enrollment method must be one of W, P, A', field: 'enrollMethod', objectName: 'account' },
  ] }
};
const RES_403_SIG  = { detail: 'The x-signature header could not be verified for the signing key', instance: '/account/', status: 403, title: 'Forbidden', type: 'about:blank' };
const RES_ACCEPTED = { metadata: {}, schema: 'urn:ascensus:529:1.0:account', memberId: '21e2e5f8-4a94-4081-864c-6bbfd1939c05', acknowledgment: 'Request accepted for processing' };
const RES_ACCEPTED_QUEUED = { ...RES_ACCEPTED, acknowledgment: 'Request queued for downstream processing', correlationId: 'CORR-7781' };
const RES_ENROLL_MULTI = { ...RES_ENROLL, 'urn:ascensus:529:1.0:account': { banks: [BANK], beneficiaries: [{ accountNumber: '1234567890', accountType: 'R', addresses: [ADDR] }, { accountNumber: '1234567891', accountType: 'C', addresses: [ADDR] }] } };

const ERR_RESPONSES = [
  { status: '400', description: 'If there is any validation error the client needs to fix, a 400 status code is returned along with the error details.', headers: RESP_HEADERS, examples: [
    { label: 'Single Field Error',    exampleDescription: 'Client-side error details are listed.', json: RES_400 },
    { label: 'Multiple Field Errors', exampleDescription: 'Several validation errors are returned together so the client can fix them in one pass.', json: RES_400_MULTI },
  ] },
  { status: '403', description: 'Forbidden. Account web access is disabled for the requested account.', headers: RESP_HEADERS, examples: [
    { label: 'Web Access Disabled', exampleDescription: 'Account web access is disabled.', json: RES_403 },
    { label: 'Invalid Signature',   exampleDescription: "The request signature could not be verified against the signing key.", json: RES_403_SIG },
  ] },
];

function writeResponses(label: string): any[] {
  return [
    { status: '201', description: 'Synchronous response when account(s) are created or updated successfully.', headers: RESP_HEADERS, examples: [
      { label, exampleDescription: 'Complete enrollment JSON and account number(s) are returned to the client in the response.', json: RES_ENROLL },
      { label: `${label} — Multiple Beneficiaries`, exampleDescription: 'Two beneficiaries are returned, each with its own account number.', json: RES_ENROLL_MULTI },
    ] },
    { status: '202', description: 'Asynchronous response. The account owner member ID is returned to the client in the response.', headers: RESP_HEADERS, examples: [
      { label: `${label} Async`,   exampleDescription: 'The request has been accepted. An acknowledgment message is returned to the client.', json: RES_ACCEPTED },
      { label: `${label} Queued`,  exampleDescription: 'The request is queued for downstream processing; a correlation id is returned to track it.', json: RES_ACCEPTED_QUEUED },
    ] },
    ...ERR_RESPONSES,
  ];
}

function readResponses(label: string, json: any, extras: any[] = []): any[] {
  return [
    { status: '200', description: 'Account or enrollment detail is returned to the client.', headers: RESP_HEADERS, examples: [
      { label, exampleDescription: 'The requested record is returned in the response body.', json },
      ...extras,
    ] },
    ...ERR_RESPONSES,
  ];
}

function accountReadExtras(schema: string): any[] {
  return [
    { label: 'Closed Account',         exampleDescription: 'A closed account remains readable; its status reflects the closure.', json: { ...RES_ENROLL, schema, status: 'closed' } },
    { label: 'Multiple Beneficiaries', exampleDescription: 'An account owner with more than one beneficiary.',                    json: { ...RES_ENROLL_MULTI, schema } },
  ];
}

function deleteEntity(entity: string, label: string, changeId: string): any {
  return { label, exampleDescription: `${label} — the ${entity} was removed and a change acknowledgment is returned to the client.`, json: { metadata: {}, schema: 'urn:ascensus:529:1.0:account', changeId, deleted: { entity, id: '300e234d-b88d-4fae-a039-ec5691bc03fa' }, status: 'updated' } };
}

function deleteResponses(label: string): any[] {
  return [
    { status: '200', description: 'Synchronous response when account entities are deleted successfully.', headers: RESP_HEADERS, examples: [
      { label, exampleDescription: 'The closed account document is returned to the client.', json: { ...RES_ENROLL, status: 'closed' } },
      deleteEntity('recurringContribution', 'DELETE Recurring Contribution', 'CHNG-DEL-001'),
      deleteEntity('bank',             'DELETE Bank',             'CHNG-DEL-002'),
      deleteEntity('interestedParty',  'DELETE Interested Party', 'CHNG-DEL-003'),
      deleteEntity('trustedContact',   'DELETE Trusted Contact',  'CHNG-DEL-004'),
      deleteEntity('successor',        'DELETE Successor',        'CHNG-DEL-005'),
    ] },
    ...ERR_RESPONSES,
  ];
}

const PUT_ACCOUNT_DESC = 'Subsequent Enrollment — this endpoint creates a subsequent enrollment for an existing account owner and follows the same processing flow as the initial POST enrollment. The PUT request requires the schema urn:ascensus:529:1.0:account and a member identifier; the username is required in the JSON for the enrollment to be processed. Update Account Contributions — the same endpoint is also used to update existing account contribution information for an account owner. Only the mutable fields supplied in the request are applied; immutable identifiers are ignored.';

export const API_DOCS: any[] = [
  { id: 'ableenrollment', name: 'AbleEnrollment', blurb: 'Submit new ABLE account enrollments.', endpoints: [
    { id: 'post-ableenrollment', method: 'POST', title: 'POST AbleEnrollment', railLabel: 'AbleEnrollment (ABLE 1.0)',
      urn: 'urn:ascensus:able:1.0:enrollment', summary: 'Submit a new ABLE account enrollment.',
      description: 'Creates a new ABLE account enrollment from the supplied payload and returns the generated account number(s). Supports both synchronous (201) and asynchronous (202) processing.',
      params: [...REQ_HEADERS],
      body: { description: 'New ABLE enrollment request.', examples: [{ label: 'POST AbleEnrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:enrollment', 'urn:ascensus:able:1.0:enrollment': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: writeResponses('POST AbleEnrollment') },
  ] },
  { id: 'account', name: 'Account', blurb: 'Retrieve, update, and close 529 accounts and process their subsequent enrollments.', endpoints: [
    { id: 'delete-account-10', method: 'DELETE', title: 'DELETE Account', railLabel: 'Account (529 1.0)', urn: 'urn:ascensus:529:1.0:account',
      summary: 'Close a 529 account that carries a zero balance (schema 1.0).',
      description: 'Closes an account. The account must carry a zero balance before it can be closed; otherwise a validation error is returned. Closing is a soft state change — the record remains readable.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: deleteResponses('DELETE Account') },
    { id: 'delete-account-11', method: 'DELETE', title: 'DELETE Account', railLabel: 'Account (529 1.1)', urn: 'urn:ascensus:529:1.1:account',
      summary: 'Close a 529 account that carries a zero balance (schema 1.1).',
      description: 'The 1.1 revision of the account close operation. The account must carry a zero balance before it can be closed.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: deleteResponses('DELETE Account') },
    { id: 'delete-account-20', method: 'DELETE', title: 'DELETE Account', railLabel: 'Account (529 2.0)', urn: 'urn:ascensus:529:2.0:account',
      summary: 'Close a 529 account that carries a zero balance (schema 2.0).',
      description: 'The 2.0 revision of the account close operation. The account must carry a zero balance before it can be closed.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: deleteResponses('DELETE Account') },
    { id: 'get-account-10', method: 'GET', title: 'GET Account', railLabel: 'Account (529 1.0)', urn: 'urn:ascensus:529:1.0:account',
      summary: 'Retrieve account and enrollment detail for the requested account owner (schema 1.0).',
      description: 'Returns the full account document for the supplied account id, including bank and beneficiary detail. Access is scoped to the partner associated with the signing key.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: readResponses('GET Account', RES_ENROLL, accountReadExtras('urn:ascensus:529:1.0:account')) },
    { id: 'get-account-11', method: 'GET', title: 'GET Account', railLabel: 'Account (529 1.1)', urn: 'urn:ascensus:529:1.1:account',
      summary: 'Retrieve account and enrollment detail for the requested account owner (schema 1.1).',
      description: 'The 1.1 revision of the account read operation. Returns the full account document for the supplied account id.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: readResponses('GET Account', { ...RES_ENROLL, schema: 'urn:ascensus:529:1.1:account' }, accountReadExtras('urn:ascensus:529:1.1:account')) },
    { id: 'get-account-20', method: 'GET', title: 'GET Account', railLabel: 'Account (529 2.0)', urn: 'urn:ascensus:529:2.0:account',
      summary: 'Retrieve account and enrollment detail for the requested account owner (schema 2.0).',
      description: 'The 2.0 revision of the account read operation. Returns the full account document for the supplied account id.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null, responses: readResponses('GET Account', { ...RES_ENROLL, schema: 'urn:ascensus:529:2.0:account' }, accountReadExtras('urn:ascensus:529:2.0:account')) },
    { id: 'put-account-10', method: 'PUT', title: 'PUT Account', railLabel: 'Account (529 1.0)', urn: 'urn:ascensus:529:1.0:account',
      summary: 'Update an account and process subsequent enrollment requests (schema 1.0).', description: PUT_ACCOUNT_DESC,
      params: [...REQ_HEADERS], body: { description: 'Account update and subsequent enrollment requests.', examples: [{ label: 'PUT Subsequent Enrollment', json: REQ_ENROLL }] },
      responses: writeResponses('PUT Subsequent Enrollment') },
    { id: 'put-account-11', method: 'PUT', title: 'PUT Account', railLabel: 'Account (529 1.1)', urn: 'urn:ascensus:529:1.1:account',
      summary: 'Update an account and process subsequent enrollment requests (schema 1.1).', description: PUT_ACCOUNT_DESC,
      params: [...REQ_HEADERS], body: { description: 'Account update and subsequent enrollment requests.', examples: [{ label: 'PUT Subsequent Enrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:529:1.1:account' } }] },
      responses: writeResponses('PUT Subsequent Enrollment') },
    { id: 'put-account-20', method: 'PUT', title: 'PUT Account', railLabel: 'Account (529 2.0)', urn: 'urn:ascensus:529:2.0:account',
      summary: 'Update an account and process subsequent enrollment requests (schema 2.0).', description: PUT_ACCOUNT_DESC,
      params: [...REQ_HEADERS], body: { description: 'Account update and subsequent enrollment requests.', examples: [{ label: 'PUT Subsequent Enrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:529:2.0:account' } }] },
      responses: writeResponses('PUT Subsequent Enrollment') },
  ] },
  { id: 'accountmetric', name: 'AccountMetric', blurb: 'Read computed account metrics such as balances and contribution totals.', endpoints: [
    { id: 'get-accountmetric', method: 'GET', title: 'GET AccountMetric', railLabel: 'AccountMetric (529 1.0)', urn: 'urn:ascensus:529:1.0:accountmetrics',
      summary: 'Retrieve computed metrics for an account.',
      description: 'Returns the latest computed metrics for an account, including total balance and source breakdown from the most recent valuation cycle.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null,
      responses: readResponses('GET AccountMetric', { schema: 'urn:ascensus:529:1.0:accountmetrics', 'urn:ascensus:529:1.0:accountmetrics': { accountId: '5590177a-31a1-4f58-8232-eeaa7a317c45', asOf: '2026-05-30', currency: 'USD', totalBalance: 84210.55, sources: [{ source: 'pre-tax', amount: 61240.10 }, { source: 'roth', amount: 19870.45 }] } }, [
        { label: 'Zero Balance', exampleDescription: 'A funded account that currently carries a zero balance.', json: { schema: 'urn:ascensus:529:1.0:accountmetrics', 'urn:ascensus:529:1.0:accountmetrics': { accountId: '5590177a-31a1-4f58-8232-eeaa7a317c45', asOf: '2026-05-30', currency: 'USD', totalBalance: 0.00, sources: [] } } },
        { label: 'With Contribution Totals', exampleDescription: 'Metrics including year-to-date contribution totals by source.', json: { schema: 'urn:ascensus:529:1.0:accountmetrics', 'urn:ascensus:529:1.0:accountmetrics': { accountId: '5590177a-31a1-4f58-8232-eeaa7a317c45', asOf: '2026-05-30', currency: 'USD', totalBalance: 84210.55, sources: [{ source: 'pre-tax', amount: 61240.10 }, { source: 'roth', amount: 19870.45 }], contributionsYtd: { total: 7000.00, byMonth: [{ month: '2026-04', amount: 3500.00 }, { month: '2026-05', amount: 3500.00 }] } } } },
      ]) },
  ] },
  { id: 'accountsearch', name: 'AccountSearch', blurb: 'Search for accounts by owner, plan, or external reference.', endpoints: [
    { id: 'get-accountsearch', method: 'GET', title: 'GET AccountSearch', railLabel: 'AccountSearch (529 1.0)', urn: 'urn:ascensus:529:1.0:accountsearch',
      summary: 'Search accounts matching the supplied criteria.',
      description: 'Returns a list of accounts matching the supplied search parameters. At least one search parameter is required. Results are scoped to the calling partner.',
      params: [...REQ_HEADERS, { name: 'lastName', type: 'string', required: false, in: 'query', example: 'Doe' }, { name: 'taxIdLast4', type: 'string', required: false, in: 'query', example: '4417' }, { name: 'planId', type: 'string', required: false, in: 'query', example: 'PLN-40192' }],
      body: null,
      responses: readResponses('AccountSearch Results', { schema: 'urn:ascensus:529:1.0:accountsearch', 'urn:ascensus:529:1.0:accountsearch': { results: [{ accountId: '5590177a-31a1-4f58-8232-eeaa7a317c45', accountHolderLastName: 'Doe', planId: 'PLN-40192', status: 'active' }] } }, [
        { label: 'Multiple Matches', exampleDescription: 'Several accounts match the supplied criteria.', json: { schema: 'urn:ascensus:529:1.0:accountsearch', 'urn:ascensus:529:1.0:accountsearch': { results: [{ accountId: '5590177a-31a1-4f58-8232-eeaa7a317c45', accountHolderLastName: 'Doe', planId: 'PLN-40192', status: 'active' }, { accountId: '7c41b920-2db3-4d77-9a18-0f3c2e9b51aa', accountHolderLastName: 'Doe', planId: 'PLN-40192', status: 'closed' }, { accountId: '9f2a118c-6e07-42d1-bd44-1c8a7e5530fb', accountHolderLastName: 'Doe', planId: 'PLN-55810', status: 'active' }] } } },
        { label: 'No Matches', exampleDescription: 'No accounts match the supplied criteria; an empty result set is returned.', json: { schema: 'urn:ascensus:529:1.0:accountsearch', 'urn:ascensus:529:1.0:accountsearch': { results: [] } } },
      ]) },
  ] },
  { id: 'enrollment', name: 'Enrollment', blurb: 'Submit new enrollments into 529 plans.', endpoints: [
    { id: 'post-enrollment-10', method: 'POST', title: 'POST Enrollment', railLabel: 'Enrollment (529 1.0)', urn: 'urn:ascensus:529:1.0:enrollment',
      summary: 'Submit a new enrollment (schema 1.0).', description: 'Submits a new enrollment for an account owner. Returns the created enrollment with the generated account number(s) on success.',
      params: [...REQ_HEADERS], body: { description: 'New enrollment request.', examples: [{ label: 'POST Enrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:529:1.0:enrollment', 'urn:ascensus:529:1.0:enrollment': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: writeResponses('POST Enrollment') },
    { id: 'post-enrollment-11', method: 'POST', title: 'POST Enrollment', railLabel: 'Enrollment (529 1.1)', urn: 'urn:ascensus:529:1.1:enrollment',
      summary: 'Submit a new enrollment (schema 1.1).', description: 'The 1.1 revision of the enrollment submission operation. Accepts the same enrollment shape with additional optional fields.',
      params: [...REQ_HEADERS], body: { description: 'New enrollment request.', examples: [{ label: 'POST Enrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:529:1.1:enrollment', 'urn:ascensus:529:1.1:enrollment': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: writeResponses('POST Enrollment') },
  ] },
  { id: 'entityenrollment', name: 'EntityEnrollmentValidationHandler', blurb: 'Validate ABLE entity enrollment requests before submission.', endpoints: [
    { id: 'post-entity', method: 'POST', title: 'POST EntityEnrollmentValidationHandler', railLabel: 'Entity (ABLE 1.0)', urn: 'urn:ascensus:able:1.0:entity',
      summary: 'Validate an ABLE entity enrollment payload and return any errors.',
      description: 'Runs validation against an ABLE entity enrollment payload without persisting it. Returns 200 when the payload is valid, or 400 with a list of field-level errors.',
      params: [...REQ_HEADERS], body: { description: 'ABLE entity enrollment validation request.', examples: [{ label: 'POST Entity Validation', json: { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:entity', 'urn:ascensus:able:1.0:entity': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: [
        { status: '200', description: 'The entity enrollment payload is valid.', headers: RESP_HEADERS, examples: [
          { label: 'Valid Entity',        exampleDescription: 'No validation errors were found.',          json: { metadata: {}, schema: 'urn:ascensus:able:1.0:entity', 'urn:ascensus:able:1.0:entity': { valid: true } } },
          { label: 'Valid with Warnings', exampleDescription: 'The payload is valid but non-blocking warnings were returned.', json: { metadata: {}, schema: 'urn:ascensus:able:1.0:entity', 'urn:ascensus:able:1.0:entity': { valid: true, warnings: [{ field: 'beneficiaries[0].addresses[0].state', message: 'State could not be verified against USPS data' }] } } },
        ] },
        ...ERR_RESPONSES,
      ] },
  ] },
  { id: 'partialenrollment', name: 'Partial Enrollment', blurb: 'Save, retrieve, and update in-progress (partial) 529 enrollments.', endpoints: [
    { id: 'get-partial', method: 'GET', title: 'GET Partial Enrollment', railLabel: 'Partial (529 1.0)', urn: 'urn:ascensus:529:1.0:account',
      summary: 'Retrieve a saved in-progress enrollment.', description: 'Returns a previously saved partial (in-progress) enrollment for the supplied account id so the applicant can resume where they left off.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null,
      responses: readResponses('GET Partial Enrollment', REQ_ENROLL, [{ label: 'In-Progress (Step 2 of 4)', exampleDescription: 'A partially completed enrollment showing how far the applicant has progressed.', json: { ...REQ_ENROLL, partial: true, lastStepCompleted: 2, totalSteps: 4 } }]) },
    { id: 'post-partial', method: 'POST', title: 'POST Partial Enrollment', railLabel: 'Partial (529 1.0)', urn: 'urn:ascensus:529:1.0:enrollment',
      summary: 'Save a new in-progress enrollment.', description: 'Persists a new partial enrollment so an in-progress application can be resumed later. No account is created until the enrollment is completed.',
      params: [...REQ_HEADERS], body: { description: 'Partial enrollment to save.', examples: [{ label: 'POST Partial Enrollment', json: { ...REQ_ENROLL, schema: 'urn:ascensus:529:1.0:enrollment', 'urn:ascensus:529:1.0:enrollment': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: writeResponses('POST Partial Enrollment') },
    { id: 'put-partial', method: 'PUT', title: 'PUT Partial Enrollment', railLabel: 'Partial (529 1.0)', urn: 'urn:ascensus:529:1.0:account',
      summary: 'Update a saved in-progress enrollment.', description: 'Replaces a previously saved partial enrollment with the supplied payload.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: { description: 'Updated partial enrollment.', examples: [{ label: 'PUT Partial Enrollment', json: REQ_ENROLL }] },
      responses: writeResponses('PUT Partial Enrollment') },
  ] },
  { id: 'partialenrollmentable', name: 'Partial Enrollment ABLE', blurb: 'Save, retrieve, and update in-progress (partial) ABLE enrollments.', endpoints: [
    { id: 'get-partial-able', method: 'GET', title: 'GET Partial Enrollment ABLE', railLabel: 'Partial ABLE (1.0)', urn: 'urn:ascensus:able:1.0:account',
      summary: 'Retrieve a saved in-progress ABLE enrollment.', description: 'Returns a previously saved partial ABLE enrollment for the supplied account id so the applicant can resume where they left off.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: null,
      responses: readResponses('GET Partial Enrollment ABLE', { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:account' }, [{ label: 'In-Progress (Step 1 of 3)', exampleDescription: 'A partially completed ABLE enrollment showing how far the applicant has progressed.', json: { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:account', partial: true, lastStepCompleted: 1, totalSteps: 3 } }]) },
    { id: 'post-partial-able', method: 'POST', title: 'POST Partial Enrollment ABLE', railLabel: 'Partial ABLE (1.0)', urn: 'urn:ascensus:able:1.0:enrollment',
      summary: 'Save a new in-progress ABLE enrollment.', description: 'Persists a new partial ABLE enrollment so an in-progress application can be resumed later.',
      params: [...REQ_HEADERS], body: { description: 'Partial ABLE enrollment to save.', examples: [{ label: 'POST Partial Enrollment ABLE', json: { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:enrollment', 'urn:ascensus:able:1.0:enrollment': REQ_ENROLL['urn:ascensus:529:1.0:account'] } }] },
      responses: writeResponses('POST Partial Enrollment ABLE') },
    { id: 'put-partial-able', method: 'PUT', title: 'PUT Partial Enrollment ABLE', railLabel: 'Partial ABLE (1.0)', urn: 'urn:ascensus:able:1.0:account',
      summary: 'Update a saved in-progress ABLE enrollment.', description: 'Replaces a previously saved partial ABLE enrollment with the supplied payload.',
      params: [...REQ_HEADERS, ACCOUNT_ID_PARAM], body: { description: 'Updated partial ABLE enrollment.', examples: [{ label: 'PUT Partial Enrollment ABLE', json: { ...REQ_ENROLL, schema: 'urn:ascensus:able:1.0:account' } }] },
      responses: writeResponses('PUT Partial Enrollment ABLE') },
  ] },
];

const DEEPLINK_ALIAS: Record<string, string> = { accounts: 'account', balances: 'accountmetric', contributions: 'enrollment', transactions: 'account', participants: 'accountsearch', authentication: 'account' };

const MEDIA_TYPES = ['application/json', 'application/xml', 'text/plain'];

function prettyJson(obj: any): string { return JSON.stringify(obj, null, 2); }
function methodMod(m: string): string  { return m.toLowerCase(); }
function statusFamily(s: string): string { return String(s).charAt(0); }

function reqExamples(label: string, json: any): any[] {
  if (!json || typeof json !== 'object') return [{ label, json }];
  const key = json.schema;
  const inner = key && json[key] && typeof json[key] === 'object' ? json[key] : null;
  const out: any[] = [{ label, exampleDescription: 'A standard, complete payload for this operation.', json }];
  if (inner) {
    const { banks, ...noBank } = inner;
    out.push({ label: `${label} — Minimal (no bank)`, exampleDescription: 'Only the required fields; bank funding details are omitted.', json: { ...json, [key]: noBank } });
    out.push({ label: `${label} — With Trusted Contact`, exampleDescription: 'Includes an optional trusted contact on the account owner.', json: { ...json, [key]: { ...inner, trustedContacts: [{ firstName: 'Sam', lastName: 'Rivera', relationship: 'sibling', phone: '617-555-0142' }] } } });
  }
  return out;
}

/* ── MethodBadge ────────────────────────────────────────────── */
@Component({
  selector: 'app-method-badge',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<span [class]="'method-badge method-badge--' + mod + (small ? ' method-badge--sm' : '')">{{ method }}</span>`
})
export class MethodBadgeComponent {
  @Input() method: string = '';
  @Input() small: boolean = false;
  get mod(): string { return methodMod(this.method); }
}

/* ── CodeBlock ──────────────────────────────────────────────── */
@Component({
  selector: 'app-code-block',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="code-block">
      <div class="code-block__bar">
        <span class="code-block__lang">JSON</span>
        <button type="button" [class]="'code-block__copy' + (copied ? ' is-copied' : '')" (click)="copy()">
          {{ copied ? '✓ Copied' : 'Copy' }}
        </button>
      </div>
      <pre><code>{{ text }}</code></pre>
    </div>
  `
})
export class CodeBlockComponent implements OnDestroy {
  @Input() json: any = null;
  @Output() toasted = new EventEmitter<string>();

  copied = false;
  private timer: any;

  get text(): string { return typeof this.json === 'string' ? this.json : prettyJson(this.json); }

  copy() {
    navigator.clipboard?.writeText(this.text).catch(() => {});
    this.copied = true;
    this.toasted.emit('Copied to clipboard');
    this.timer = setTimeout(() => { this.copied = false; }, 1600);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}

/* ── HeaderTable ────────────────────────────────────────────── */
@Component({
  selector: 'app-header-table',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <table *ngIf="headers && headers.length" class="resp-headers">
      <caption>Headers</caption>
      <thead><tr><th>Name</th><th>Description</th><th>Type</th></tr></thead>
      <tbody>
        <tr *ngFor="let h of headers">
          <td data-label="Name" class="resp-headers__name">{{ h.name }}</td>
          <td data-label="Description">{{ h.description }}</td>
          <td data-label="Type" class="resp-headers__type">{{ h.type }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class HeaderTableComponent {
  @Input() headers: any[] = [];
}

/* ── CopyField ──────────────────────────────────────────────── */
@Component({
  selector: 'app-copy-field',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <span *ngIf="!value" class="copy-field__empty">—</span>
    <div *ngIf="value" class="copy-field">
      <code class="copy-field__val" [title]="value">{{ value }}</code>
      <button type="button" [class]="'copy-field__btn' + (copied ? ' is-copied' : '')"
              (click)="copy()" [attr.aria-label]="'Copy ' + value">
        {{ copied ? '✓' : '⧉' }}
      </button>
    </div>
  `
})
export class CopyFieldComponent implements OnDestroy {
  @Input() value: string = '';
  @Output() toasted = new EventEmitter<string>();

  copied = false;
  private timer: any;

  copy() {
    navigator.clipboard?.writeText(this.value).catch(() => {});
    this.copied = true;
    this.toasted.emit('Copied to clipboard');
    this.timer = setTimeout(() => { this.copied = false; }, 1500);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}

/* ── ParamTable ─────────────────────────────────────────────── */
@Component({
  selector: 'app-param-table',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, CopyFieldComponent],
  template: `
    <p *ngIf="!params || !params.length" class="doc-section__empty">This endpoint takes no parameters.</p>
    <table *ngIf="params && params.length" class="param-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th class="param-table__incol">Example</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of params">
          <td data-label="Name"><span class="param-table__name">{{ p.name }}</span></td>
          <td data-label="Type"><span class="param-table__type">{{ p.type }}{{ p.in ? ' · ' + p.in : '' }}</span></td>
          <td data-label="Example" class="param-table__incol">
            <app-copy-field [value]="exampleVal(p)" (toasted)="toasted.emit($event)"></app-copy-field>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class ParamTableComponent {
  @Input() params: any[] = [];
  @Output() toasted = new EventEmitter<string>();

  exampleVal(p: any): string {
    if (p.example != null) return String(p.example);
    if (p.enum)            return p.enum.join(' | ');
    return '';
  }
}

/* ── DocControls ────────────────────────────────────────────── */
@Component({
  selector: 'app-doc-controls',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="doc-control">
      <label class="doc-field">
        <span class="doc-field__label">Media type</span>
        <select class="select" [value]="media" (change)="media = $any($event.target).value" aria-label="Media type">
          <option *ngFor="let m of MEDIA_TYPES" [value]="m">{{ m }}</option>
        </select>
        <span *ngIf="hint" class="doc-field__hint">{{ hint }}</span>
      </label>
      <label *ngIf="examples && examples.length > 0" class="doc-field">
        <span class="doc-field__label">Examples</span>
        <select class="select" [value]="idx" (change)="idxChange.emit(+$any($event.target).value)" aria-label="Examples">
          <option *ngFor="let e of examples; let i = index" [value]="i">{{ e.label }}</option>
        </select>
      </label>
    </div>
  `
})
export class DocControlsComponent {
  @Input() examples: any[] = [];
  @Input() idx: number = 0;
  @Input() hint: string = '';
  @Output() idxChange = new EventEmitter<number>();

  media = MEDIA_TYPES[0];
  MEDIA_TYPES = MEDIA_TYPES;
}

/* ── RequestBody ────────────────────────────────────────────── */
@Component({
  selector: 'app-request-body',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, DocControlsComponent, CodeBlockComponent],
  template: `
    <p *ngIf="!body || !body.examples || !body.examples.length" class="doc-section__empty">
      This endpoint does not take a request body.
    </p>
    <div *ngIf="body && body.examples && body.examples.length">
      <p *ngIf="body.description" class="doc-section__text" style="margin-bottom:14px">{{ body.description }}</p>
      <app-doc-controls
        [examples]="examples"
        [idx]="safeIdx"
        hint="Controls Content-Type header."
        (idxChange)="idx = $event">
      </app-doc-controls>
      <app-code-block [json]="currentEx.json" (toasted)="toasted.emit($event)"></app-code-block>
    </div>
  `
})
export class RequestBodyComponent {
  @Input() body: any = null;
  @Output() toasted = new EventEmitter<string>();

  idx = 0;

  get examples(): any[] {
    if (!this.body?.examples?.length) return [];
    return this.body.examples.length === 1
      ? reqExamples(this.body.examples[0].label, this.body.examples[0].json)
      : this.body.examples;
  }

  get safeIdx(): number { return Math.min(this.idx, Math.max(0, this.examples.length - 1)); }
  get currentEx(): any  { return this.examples[this.safeIdx] || {}; }
}

/* ── ResponseBlock ──────────────────────────────────────────── */
@Component({
  selector: 'app-response-block',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, DocControlsComponent, CodeBlockComponent, HeaderTableComponent],
  template: `
    <p *ngIf="!responses || !responses.length" class="doc-section__empty">No response documented.</p>
    <div *ngIf="responses && responses.length">
      <div class="status-pills" role="tablist" aria-label="Response statuses">
        <button *ngFor="let r of responses; let i = index"
          type="button" role="tab"
          [attr.aria-selected]="i === statusIdx"
          [class]="'status-pill status-pill--' + statusFamily(r.status) + (i === statusIdx ? ' is-active' : '')"
          (click)="pickStatus(i)">
          <span class="status-pill__dot"></span>{{ r.status }}
        </button>
      </div>
      <p *ngIf="resp.description" class="doc-section__text" style="margin-bottom:14px">{{ resp.description }}</p>
      <app-doc-controls
        [examples]="resp.examples"
        [idx]="safeExIdx"
        hint="Controls Accept header."
        (idxChange)="exIdx = $event">
      </app-doc-controls>
      <app-code-block [json]="currentEx.json" (toasted)="toasted.emit($event)"></app-code-block>
      <p *ngIf="currentEx.exampleDescription" class="example-desc">{{ currentEx.exampleDescription }}</p>
      <app-header-table [headers]="resp.headers"></app-header-table>
    </div>
  `
})
export class ResponseBlockComponent {
  @Input() responses: any[] = [];
  @Output() toasted = new EventEmitter<string>();

  statusIdx = 0;
  exIdx = 0;

  statusFamily(s: string): string { return statusFamily(s); }

  get resp(): any     { return this.responses[Math.min(this.statusIdx, this.responses.length - 1)] || {}; }
  get safeExIdx(): number { return Math.min(this.exIdx, Math.max(0, (this.resp.examples?.length || 1) - 1)); }
  get currentEx(): any    { return (this.resp.examples || [])[this.safeExIdx] || {}; }

  pickStatus(i: number) { this.statusIdx = i; this.exIdx = 0; }
}

/* ── EndpointSection ────────────────────────────────────────── */
@Component({
  selector: 'app-endpoint-section',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MethodBadgeComponent, ParamTableComponent, RequestBodyComponent, ResponseBlockComponent],
  template: `
    <div class="endpoint" [id]="'ep-' + ep.id" [attr.data-screen-label]="ep.method + ' ' + ep.title">
      <button type="button" class="endpoint__summary" [attr.aria-expanded]="open" (click)="toggled.emit()">
        <app-method-badge [method]="ep.method"></app-method-badge>
        <span class="endpoint__heading">
          <span class="endpoint__title">
            <span class="endpoint__name">{{ ep.title }}</span>
            <span class="endpoint__urn">{{ ep.urn }}</span>
          </span>
          <p class="endpoint__desc">{{ ep.summary }}</p>
        </span>
        <span [class]="'endpoint__chevron' + (open ? ' is-open' : '')" aria-hidden="true">&#8250;</span>
      </button>

      <div *ngIf="open" class="endpoint__body">
        <div class="doc-section">
          <span class="doc-section__label">Description</span>
          <p class="doc-section__text">{{ ep.description }}</p>
        </div>
        <div class="doc-section">
          <span class="doc-section__label">Parameters (Required)</span>
          <app-param-table [params]="ep.params" (toasted)="toasted.emit($event)"></app-param-table>
        </div>
        <div class="doc-section">
          <span class="doc-section__label">Request Body (Required if applicable)</span>
          <app-request-body [body]="ep.body" (toasted)="toasted.emit($event)"></app-request-body>
        </div>
        <div class="doc-section">
          <span class="doc-section__label">Response</span>
          <app-response-block [responses]="ep.responses" (toasted)="toasted.emit($event)"></app-response-block>
        </div>
      </div>
    </div>
  `
})
export class EndpointSectionComponent {
  @Input() ep: any = null;
  @Input() open: boolean = false;
  @Output() toggled = new EventEmitter<void>();
  @Output() toasted = new EventEmitter<string>();
}

/* ── ApiDocsPage ────────────────────────────────────────────── */
@Component({
  selector: 'app-api-docs-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MethodBadgeComponent, EndpointSectionComponent],
  templateUrl: './apidocs.component.html',
})
export class ApiDocsPageComponent implements OnInit {
  @Input() target: any = null;
  @Output() back = new EventEmitter<void>();
  @Output() toasted = new EventEmitter<string>();

  API_DOCS = API_DOCS;

  query = '';
  activeApi = '';
  openGroups = new Set<string>();
  openEndpoints = new Set<string>();

  ngOnInit() {
    const resolved = this.resolveId(this.target?.apiId);
    this.activeApi = resolved;
    this.openGroups = new Set([resolved]);
    this.openEndpoints = this.target?.endpointId
      ? new Set([this.target.endpointId])
      : new Set();
    if (this.target?.endpointId) {
      this.scrollToEndpoint(this.target.endpointId);
    }
  }

  private resolveId(raw: string | null | undefined): string {
    if (!raw) return API_DOCS[0].id;
    if (API_DOCS.some(a => a.id === raw)) return raw;
    const alias = DEEPLINK_ALIAS[raw];
    if (alias && API_DOCS.some(a => a.id === alias)) return alias;
    return API_DOCS[0].id;
  }

  get q(): string { return this.query.trim().toLowerCase(); }

  get filtered(): any[] {
    if (!this.q) return API_DOCS;
    return API_DOCS.map(api => {
      const groupMatch = api.name.toLowerCase().includes(this.q);
      const eps = groupMatch ? api.endpoints : api.endpoints.filter((ep: any) =>
        ep.urn.toLowerCase().includes(this.q) ||
        ep.title.toLowerCase().includes(this.q) ||
        ep.railLabel.toLowerCase().includes(this.q) ||
        ep.summary.toLowerCase().includes(this.q) ||
        ep.method.toLowerCase().includes(this.q)
      );
      return { ...api, endpoints: eps, _groupMatch: groupMatch };
    }).filter(api => api._groupMatch || api.endpoints.length);
  }

  get activeGroup(): any {
    return this.filtered.find(a => a.id === this.activeApi)
      || API_DOCS.find(a => a.id === this.activeApi)
      || API_DOCS[0];
  }

  isGroupOpen(id: string): boolean    { return !!this.q || this.openGroups.has(id); }
  isEndpointOpen(id: string): boolean { return this.openEndpoints.has(id); }

  selectApi(id: string) {
    this.activeApi = id;
    this.openGroups = new Set([id]);
  }

  toggleGroupCaret(id: string, e: MouseEvent) {
    e.stopPropagation();
    const next = new Set(this.openGroups);
    next.has(id) ? next.delete(id) : next.add(id);
    this.openGroups = next;
  }

  openEndpoint(apiId: string, epId: string) {
    this.activeApi = apiId;
    this.openGroups = new Set([apiId]);
    const next = new Set(this.openEndpoints);
    next.add(epId);
    this.openEndpoints = next;
    this.scrollToEndpoint(epId);
  }

  toggleEndpoint(epId: string) {
    const next = new Set(this.openEndpoints);
    next.has(epId) ? next.delete(epId) : next.add(epId);
    this.openEndpoints = next;
  }

  onQueryChange(val: string) {
    this.query = val;
    if (val.trim() && !this.filtered.some(a => a.id === this.activeApi) && this.filtered.length) {
      this.activeApi = this.filtered[0].id;
    }
  }

  scrollToEndpoint(epId: string) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(`ep-${epId}`);
      const scroller = el && el.closest('.page') as HTMLElement | null;
      if (el && scroller) {
        const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 12;
        scroller.scrollTop = Math.max(0, top);
      }
    }));
  }
}
