"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatBot = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const axios_1 = __importDefault(require("axios"));
class WechatBot {
    constructor() {
        this.description = {
            displayName: '企业微信机器人',
            name: 'wechatBot',
            group: ['output'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: '向企业微信群机器人发送消息',
            defaults: {
                name: '企业微信机器人',
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: [],
            properties: [
                {
                    displayName: '机器人Webhook Key',
                    name: 'webhookKey',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    description: '企业微信群机器人的Webhook Key，从机器人配置页面获取',
                },
                {
                    displayName: '消息类型',
                    name: 'messageType',
                    type: 'options',
                    required: true,
                    default: 'text',
                    options: [
                        {
                            name: '文本消息',
                            value: 'text',
                        },
                        {
                            name: 'Markdown消息',
                            value: 'markdown',
                        },
                    ],
                    description: '要发送的消息类型',
                },
                {
                    displayName: '消息内容',
                    name: 'content',
                    type: 'string',
                    typeOptions: {
                        alwaysOpenEditWindow: true,
                    },
                    required: true,
                    default: '',
                    placeholder: '请输入要发送的消息内容',
                    description: '要发送到企业微信群的消息内容',
                },
                {
                    displayName: '@所有人',
                    name: 'mentionedAll',
                    type: 'boolean',
                    default: false,
                    description: '是否@所有人（仅对文本消息有效）',
                },
                {
                    displayName: '@指定用户',
                    name: 'mentionedList',
                    type: 'string',
                    default: '',
                    placeholder: '用户ID1,用户ID2',
                    description: '要@的用户ID列表，用逗号分隔（仅对文本消息有效）',
                    displayOptions: {
                        show: {
                            messageType: ['text'],
                        },
                    },
                },
                {
                    displayName: '@指定手机号',
                    name: 'mentionedMobileList',
                    type: 'string',
                    default: '',
                    placeholder: '13800000001,13800000002',
                    description: '要@的用户手机号列表，用逗号分隔（仅对文本消息有效）',
                    displayOptions: {
                        show: {
                            messageType: ['text'],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const webhookKey = this.getNodeParameter('webhookKey', i);
                const messageType = this.getNodeParameter('messageType', i);
                const content = this.getNodeParameter('content', i);
                const mentionedAll = this.getNodeParameter('mentionedAll', i, false);
                const mentionedList = this.getNodeParameter('mentionedList', i, '');
                const mentionedMobileList = this.getNodeParameter('mentionedMobileList', i, '');
                if (!webhookKey) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), '机器人Webhook Key不能为空');
                }
                if (!content) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), '消息内容不能为空');
                }
                const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`;
                let requestBody = {
                    msgtype: messageType,
                };
                if (messageType === 'text') {
                    requestBody.text = {
                        content: content,
                    };
                    if (mentionedAll || mentionedList || mentionedMobileList) {
                        requestBody.text.mentioned_list = mentionedAll ? ['@all'] : [];
                        if (mentionedList) {
                            const userIds = mentionedList.split(',').map(id => id.trim()).filter(id => id);
                            requestBody.text.mentioned_list = requestBody.text.mentioned_list.concat(userIds);
                        }
                        if (mentionedMobileList) {
                            const mobileList = mentionedMobileList.split(',').map(mobile => mobile.trim()).filter(mobile => mobile);
                            requestBody.text.mentioned_mobile_list = mobileList;
                        }
                    }
                }
                else if (messageType === 'markdown') {
                    requestBody.markdown = {
                        content: content,
                    };
                }
                const response = await axios_1.default.post(webhookUrl, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                });
                if (response.data.errcode !== 0) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `企业微信API错误: ${response.data.errmsg} (错误码: ${response.data.errcode})`);
                }
                returnData.push({
                    json: {
                        success: true,
                        message: '消息发送成功',
                        webhookKey,
                        messageType,
                        content,
                        response: response.data,
                    },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.WechatBot = WechatBot;
