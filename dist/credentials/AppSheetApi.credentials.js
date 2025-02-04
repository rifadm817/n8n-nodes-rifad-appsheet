"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSheetApi = void 0;
class AppSheetApi {
    constructor() {
        this.name = 'appSheetApi';
        this.displayName = 'AppSheet API';
        this.properties = [
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
}
exports.AppSheetApi = AppSheetApi;
