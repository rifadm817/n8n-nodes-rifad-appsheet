"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentAppSheet = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class AIAgentAppSheet {
    constructor() {
        this.description = {
            displayName: 'AppSheet (AI Agent Tool)',
            name: 'aiAgentAppSheet',
            icon: 'file:appsheet.svg',
            group: ['aiTools'], // Use a distinct group for AI Agent nodes
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'This node exposes the AppSheet API as a tool for AI agents. It supports the same operations as the standard AppSheet node (create, read, update, delete, and invoke actions) but is intended for use by n8n AI agents.',
            defaults: {
                name: 'AI Agent AppSheet',
            },
            inputs: [
                {
                    displayName: 'Main',
                    name: 'main',
                    type: 'main',
                    default: '',
                    description: 'Input data',
                },
            ],
            outputs: [
                {
                    displayName: 'Main',
                    name: 'main',
                    type: 'main',
                    default: '',
                    description: 'Output data',
                },
            ],
            credentials: [
                {
                    name: 'appSheetApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Region',
                    name: 'region',
                    type: 'options',
                    options: [
                        { name: 'Global (www.appsheet.com)', value: 'www.appsheet.com' },
                        { name: 'EU (eu.appsheet.com)', value: 'eu.appsheet.com' },
                    ],
                    default: 'www.appsheet.com',
                    description: 'The AppSheet region domain to use in the API URL.',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    options: [
                        { name: 'Create Record', value: 'create' },
                        { name: 'Read Records', value: 'read' },
                        { name: 'Update Record', value: 'update' },
                        { name: 'Delete Record', value: 'delete' },
                        { name: 'Invoke Action', value: 'invoke' },
                    ],
                    default: 'create',
                    noDataExpression: false, // Allows using expressions for dynamic operation selection.
                    description: 'Which operation to perform in AppSheet. This can be set dynamically via expressions.',
                },
                {
                    displayName: 'Table Name',
                    name: 'tableName',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Name of the AppSheet table (URL-encoded if needed).',
                },
                // READ-specific parameters
                {
                    displayName: 'Selector (for Read)',
                    name: 'selector',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['read'],
                        },
                    },
                    default: '',
                    description: 'Enter a valid AppSheet selector expression (e.g., FILTER(People, [Age]>=21)). If provided, the "Rows" input is ignored.',
                },
                {
                    displayName: 'Rows (for Read if Selector is empty)',
                    name: 'rows',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['read'],
                            selector: [''],
                        },
                    },
                    default: '',
                    description: 'Optional: Enter a JSON array of key objects to read specific rows. Example: [ { "Product Group": "Helmet" } ]',
                },
                // CREATE-specific parameter
                {
                    displayName: 'Record Data',
                    name: 'recordData',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['create'],
                        },
                    },
                    default: '',
                    description: 'Enter a JSON array of objects representing the record(s) to add. Each object must include the key fields required by your table. For example, if "Product Group" is a key field, use:' +
                        '\n\n```json\n[{\n  "Product Group": "New Product Group",\n  "Product Group Image": "https://example.com/images/new-product-group.png",\n  "Default UOM": "Units",\n  "Tender Summary Initial Template": "Default Tender Template",\n  "Product Group Short Code": "NPG",\n  "Model Naming Syntax": "NPG-{ID}"\n}]\n```',
                },
                // UPDATE-specific parameter
                {
                    displayName: 'Update Data',
                    name: 'updateData',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['update'],
                        },
                    },
                    default: '',
                    description: 'Enter a JSON array of objects representing the record(s) to update. Each object must include the key fields and the fields to update. Example:' +
                        '\n\n```json\n[{\n  "Product Group": "Existing Group",\n  "Product Group Short Code": "EG",\n  "Model Naming Syntax": "EG-{NewCode}"\n}]\n```',
                },
                // DELETE-specific parameter
                {
                    displayName: 'Delete Data (JSON)',
                    name: 'deleteData',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['delete'],
                        },
                    },
                    default: '',
                    description: 'Enter a JSON array of objects specifying the key fields of the record(s) to delete. Example:' +
                        '\n\n```json\n[{\n  "Product Group": "Group To Delete"\n}]\n```',
                },
                // INVOKE-specific parameters
                {
                    displayName: 'Action Name',
                    name: 'actionName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['invoke'],
                        },
                    },
                    default: '',
                    description: 'The name of the action to invoke. For example, "IncrementCountAction".',
                },
                {
                    displayName: 'Action Properties',
                    name: 'actionProperties',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['invoke'],
                        },
                    },
                    default: '',
                    description: 'Optional: Enter additional properties for the action as a JSON object. For example:' +
                        '\n\n```json\n{"UserSettings": {"Option 1": "value1", "Option 2": "value2"}}\n```',
                },
                {
                    displayName: 'Rows (for Invoke, if needed)',
                    name: 'invokeRows',
                    type: 'json',
                    displayOptions: {
                        show: {
                            operation: ['invoke'],
                        },
                    },
                    default: '',
                    description: 'Optional: Enter a JSON array of key objects for the rows on which to invoke the action. Example: [ { "Product Group": "Group Key" } ]',
                },
                // Common properties for all operations
                {
                    displayName: 'Locale',
                    name: 'locale',
                    type: 'string',
                    default: 'en-US',
                    description: 'Locale used for formatting dates and numbers (e.g., en-US).',
                },
                {
                    displayName: 'Location',
                    name: 'location',
                    type: 'string',
                    default: '47.623098, -122.330184',
                    description: 'Geographical coordinates (e.g., 47.623098, -122.330184).',
                },
                {
                    displayName: 'Timezone',
                    name: 'timezone',
                    type: 'string',
                    default: 'Pacific Standard Time',
                    description: 'Timezone used for date/time formatting.',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('appSheetApi');
        // Common properties for all requests:
        const commonProperties = {
            Locale: this.getNodeParameter('locale', 0),
            Location: this.getNodeParameter('location', 0),
            Timezone: this.getNodeParameter('timezone', 0),
        };
        // Retrieve the region parameter:
        const region = this.getNodeParameter('region', 0);
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i);
            const tableName = this.getNodeParameter('tableName', i);
            let body = {
                AppID: credentials.appId,
                TableName: tableName,
                Properties: commonProperties,
            };
            switch (operation) {
                case 'create': {
                    const recordData = this.getNodeParameter('recordData', i);
                    try {
                        body.Rows = JSON.parse(recordData);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON format in Record Data. Must be a JSON array of objects.');
                    }
                    body.Action = 'Add';
                    break;
                }
                case 'read': {
                    body.Action = 'Find';
                    const selector = this.getNodeParameter('selector', i);
                    if (selector.trim() !== '') {
                        body.Properties = { ...commonProperties, Selector: selector };
                    }
                    else {
                        const rowsData = this.getNodeParameter('rows', i);
                        try {
                            body.Rows = JSON.parse(rowsData);
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON format in Rows. Must be a JSON array of objects.');
                        }
                    }
                    break;
                }
                case 'update': {
                    const updateData = this.getNodeParameter('updateData', i);
                    try {
                        body.Rows = JSON.parse(updateData);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON in Update Data. Must be a JSON array of objects.');
                    }
                    body.Action = 'Edit';
                    break;
                }
                case 'delete': {
                    const deleteData = this.getNodeParameter('deleteData', i);
                    try {
                        body.Rows = JSON.parse(deleteData);
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON in Delete Data. Must be a JSON array of objects.');
                    }
                    body.Action = 'Delete';
                    break;
                }
                case 'invoke': {
                    const actionName = this.getNodeParameter('actionName', i);
                    body.Action = actionName || '';
                    const actionProps = this.getNodeParameter('actionProperties', i);
                    if (actionProps.trim() !== '') {
                        try {
                            body.Properties = { ...commonProperties, ...JSON.parse(actionProps) };
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON in Action Properties. Must be a JSON object.');
                        }
                    }
                    else {
                        body.Properties = commonProperties;
                    }
                    const invokeRowsData = this.getNodeParameter('invokeRows', i);
                    if (invokeRowsData.trim() !== '') {
                        try {
                            body.Rows = JSON.parse(invokeRowsData);
                        }
                        catch (error) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid JSON in Invoke Rows. Must be a JSON array of objects.');
                        }
                    }
                    break;
                }
                default:
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Operation "${operation}" not supported!`);
            }
            const requestOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'ApplicationAccessKey': credentials.apiKey,
                },
                body,
                method: 'POST',
                url: `https://${region}/api/v2/apps/${credentials.appId}/tables/${encodeURIComponent(tableName)}/Action`,
            };
            const response = await this.helpers.httpRequest(requestOptions);
            if (Array.isArray(response)) {
                returnData.push(...response);
            }
            else {
                returnData.push(response);
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
exports.AIAgentAppSheet = AIAgentAppSheet;
