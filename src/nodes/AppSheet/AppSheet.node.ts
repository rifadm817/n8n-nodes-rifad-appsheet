import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	INodeInputConfiguration,
	INodeOutputConfiguration,
	IHttpRequestOptions,
} from 'n8n-workflow';

interface AppSheetCredentials {
	apiKey: string;
	appId: string;
}

export class AppSheet implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AppSheet',
		name: 'appSheet',
		icon: 'file:appsheet.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Interact with the AppSheet API to add, read, update, delete records, or invoke a custom action on table records.',
		defaults: {
			name: 'AppSheet',
		},
		inputs: [
			{
				displayName: 'Main',
				name: 'main',
				type: 'main',
				default: '',
				description: 'Input data',
			} as INodeInputConfiguration,
		],
		outputs: [
			{
				displayName: 'Main',
				name: 'main',
				type: 'main',
				default: '',
				description: 'Output data',
			} as INodeOutputConfiguration,
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
				noDataExpression: false,
				options: [
					{ name: 'Create Record', value: 'create' },
					{ name: 'Read Records', value: 'read' },
					{ name: 'Update Record', value: 'update' },
					{ name: 'Delete Record', value: 'delete' },
					{ name: 'Invoke Action', value: 'invoke' },
				],
				default: 'create',
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
				description:
					'Enter a valid AppSheet selector expression (e.g., FILTER(People, [Age]>=21)). If provided, the "Rows" input is ignored.',
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
				description:
					'Optional: Enter a JSON array of key objects to read specific rows. Example: [ { "Product Group": "Helmet" } ]',
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
				description:
					'Enter a JSON array of objects representing the record(s) to add. Each object must include the key fields required by your table. For example, if "Product Group" is a key field, use:' +
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
				description:
					'Enter a JSON array of objects representing the record(s) to update. Each object must include the key fields and the fields to update. Example:' +
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
				description:
					'Enter a JSON array of objects specifying the key fields of the record(s) to delete. Example:' +
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
				description:
					'The name of the action to invoke. For example, "IncrementCountAction".',
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
				description:
					'Optional: Enter additional properties for the action as a JSON object. For example:' +
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
				description:
					'Optional: Enter a JSON array of key objects for the rows on which to invoke the action. Example: [ { "Product Group": "Group Key" } ]',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials<AppSheetCredentials>('appSheetApi');

		// Common properties for all requests:
		const commonProperties: IDataObject = {
			Locale: this.getNodeParameter('locale', 0) as string,
			Location: this.getNodeParameter('location', 0) as string,
			Timezone: this.getNodeParameter('timezone', 0) as string,
		};

		// Retrieve the region parameter:
		const region = this.getNodeParameter('region', 0) as string;

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			const tableName = this.getNodeParameter('tableName', i) as string;
			let body: IDataObject = {
				AppID: credentials.appId,
				TableName: tableName,
				Properties: commonProperties,
			};

			switch (operation) {
				case 'create': {
					const recordData = this.getNodeParameter('recordData', i) as string;
					try {
						body.Rows = JSON.parse(recordData);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Record Data. It must be a JSON array of objects.');
					}
					body.Action = 'Add';
					break;
				}
				case 'read': {
					const selector = this.getNodeParameter('selector', i) as string;
					body.Action = 'Find';
					if (selector && selector.trim() !== '') {
						body.Properties = { ...commonProperties, Selector: selector };
					} else {
						const rowsData = this.getNodeParameter('rows', i) as string;
						try {
							body.Rows = JSON.parse(rowsData);
						} catch (e) {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Rows data. It must be a JSON array of objects.');
						}
					}
					break;
				}
				case 'update': {
					const updateData = this.getNodeParameter('updateData', i) as string;
					try {
						body.Rows = JSON.parse(updateData);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Update Data. It must be a JSON array of objects.');
					}
					body.Action = 'Edit';
					break;
				}
				case 'delete': {
					const deleteData = this.getNodeParameter('deleteData', i) as string;
					try {
						body.Rows = JSON.parse(deleteData);
					} catch (e) {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Delete Data. It must be a JSON array of objects.');
					}
					body.Action = 'Delete';
					break;
				}
				case 'invoke': {
					const actionName = this.getNodeParameter('actionName', i) as string;
					body.Action = actionName;
					const actionProperties = this.getNodeParameter('actionProperties', i) as string;
					if (actionProperties && actionProperties.trim() !== '') {
						try {
							body.Properties = { ...commonProperties, ...JSON.parse(actionProperties) };
						} catch (e) {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Action Properties. It must be a JSON object.');
						}
					} else {
						body.Properties = commonProperties;
					}
					const invokeRowsData = this.getNodeParameter('invokeRows', i) as string;
					if (invokeRowsData && invokeRowsData.trim() !== '') {
						try {
							body.Rows = JSON.parse(invokeRowsData);
						} catch (e) {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON format in Invoke Rows data. It must be a JSON array of objects.');
						}
					}
					break;
				}
				default:
					throw new NodeOperationError(this.getNode(), `Operation "${operation}" not supported!`);
			}

			const requestOptions: IHttpRequestOptions = {
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
			} else {
				returnData.push(response);
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
