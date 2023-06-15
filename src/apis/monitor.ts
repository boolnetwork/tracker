import axios from 'axios';
import { MONITOR_URL } from '../constant';
import { UncheckParams } from '../types';

export const postUncheckTransaction = async (param: UncheckParams): Promise<String> => {
	const instance = axios.create({
		baseURL: MONITOR_URL,
		timeout: 3000,
		headers: { 'content-type': 'application/json' }
	});
	return await post(instance, '/uncheck_transaction', param);
};

const post = async (instance: any, path: string, params: any): Promise<any> => {
	return new Promise(function (resolve, reject) {
		instance
			.post(path, JSON.stringify(params))
			.then(function (response: any) {
				resolve(response.data);
			})
			.catch(function (error: any) {
				reject(error.response.data);
			});
	});
};
