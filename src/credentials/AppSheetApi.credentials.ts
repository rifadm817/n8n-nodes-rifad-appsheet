import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AppSheetApi implements ICredentialType {
    name = 'appSheetApi';
    displayName = 'AppSheet API';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
        },
        {
            displayName: 'App ID',
            name: 'appId',
            type: 'string',
            default: '',
        },
    ];
}
