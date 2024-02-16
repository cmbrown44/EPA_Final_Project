import { action, makeAutoObservable, observable } from 'mobx';
import { fetchData, uploadNewQuestion } from '../utils/api';

export interface QwizData {
    role: string,
    question: string,
    type: string
}

class QwizStore {
    data: QwizData[] = [];

    constructor() {
        makeAutoObservable(this, {
            data: observable,
            fetchDataFromApi: action,
            setData: action,
        });
    }

    async fetchDataFromApi(url: string) {
        try {
            const newData = await fetchData(url);
            this.setData(newData);
        } catch (error) {
            console.error('Its an error: ', error)
        }
    }

    setData(newData: QwizData[]) {
        this.data = newData;
    }

}

export default new QwizStore();