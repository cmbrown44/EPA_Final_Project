import axios, { AxiosResponse } from 'axios'
import { QwizData } from '../store/qwizStore';
import { url } from 'inspector';
import { createApiPath } from './helpers';

// fetch questions

export async function fetchData(url: string) {
    try {
        const response: AxiosResponse<QwizData[]> = await axios.get<QwizData[]>(url);
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export default fetchData;

// put data

export async function uploadNewQuestion(body: QwizData) {

    const urlbuild = createApiPath() + "/put-question"

    return putData(urlbuild, body)
}

const putData = async (url: string, body: QwizData): Promise<number> => {
    try {
        const result = await axios.put(url, JSON.stringify(body));
        return result.status;
    }
    catch (error) {
        console.error('Error putting data', error)
        throw error;
    }
}