import React, { useEffect, useState } from 'react';
import { OptionDefinition } from '@cloudscape-design/components/internal/components/option/interfaces';
import { observer, useLocalObservable } from "mobx-react-lite";

import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import Header from '@cloudscape-design/components/header';
import HelpPanel from '@cloudscape-design/components/help-panel';
import SpaceBetween from '@cloudscape-design/components/space-between';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Container from '@cloudscape-design/components/container';
import Input from '@cloudscape-design/components/input'
import { Flashbar, Multiselect } from '@cloudscape-design/components';
import { Navigation } from '../../components/navigation';
// import api actions to upload data
import { uploadNewQuestion } from '../../../../utils/api'
import { QwizData } from '../../../../store/qwizStore';

const isEmptyString = (value: string) => !value?.length;
const isEmptySelection = (value: readonly OptionDefinition[]) => !value.length;

type FlashMessageType = {
    type: 'success';
    dismissible: boolean;
    dismissLabel: string;
    onDismiss: () => void;
    content: React.ReactNode;
    id: string;
} | {
    type: 'error';
    dismissible: boolean;
    dismissLabel: string;
    onDismiss: () => void;
    content: React.ReactNode;
    id: string;
} | null;


export default function Body() {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [selectedRole, setSelectedRole] = useState<readonly OptionDefinition[]>([]);
    const [question, setQuestion] = useState('');
    const [selectedType, setSelectedType] = useState<readonly OptionDefinition[]>([]);
    const [flashMessage, setFlashMessage] = useState<FlashMessageType>(null);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateForm()) {
            console.error('Please complete all required fields before submitting.');
            return;
        }

        const questionData = {
            role: selectedRole.length > 0 ? selectedRole[0].value : '',
            type: selectedType.length > 0 ? selectedType[0].value : '',
        }

        const questionBody: QwizData = {
            role: questionData.role,
            question: question,
            type: questionData.type,
        }

        try {
            const response = await uploadNewQuestion(questionBody);

            location.href = "#/upload";

            if (response == 200) {
                // Handle successful response
                console.log('PUT request successful');

                setFlashMessage({
                    type: 'success',
                    dismissible: true,
                    dismissLabel: 'Dismiss message',
                    onDismiss: () => setFlashMessage(null),
                    content: ' Question submitted successfully!',
                    id: 'success_message',
                });

                setSelectedType([]);
                setQuestion('');
                setSelectedRole([]);
            } else {
                // Handle error response
                console.error('PUT request failed');
            }
        } catch (error) {
            console.error('Error uploading the question', error);

            setFlashMessage({
                type: 'error',
                dismissible: true,
                dismissLabel: 'Dismiss message',
                onDismiss: () => setFlashMessage(null),
                content: 'Error submitting question. Please try again.',
                id: 'error_message',
            });

            if (error.response && error.response.status) {
                console.error('Response', error.response.status);
            }
        }

        setIsFormSubmitted(true);
    };

    const validateForm = () => {
        return selectedType.length > 0 && selectedRole.length > 0 && question.trim() !== '';
    };

    const handleClick = () => {
        if (selectedType.length != 0 && question != '' && selectedRole.length != 0) {
            location.href = "#/upload"
        }
    }


    return (
        <form
            onSubmit={handleSubmit}
        >
            <Form
                actions={
                    <SpaceBetween direction="horizontal" size="xs">
                        <Button href="#/main" variant="link">
                            Return
                        </Button>
                        <Button formAction="submit" variant="primary" onClick={handleClick}>
                            Create Question
                        </Button>
                    </SpaceBetween>
                }
            >
                {flashMessage && <Flashbar items={[flashMessage]} />}
                <SpaceBetween size="l">
                    <Container
                        header={
                            <Header variant="h2">
                                Create a New Interview Question
                            </Header>
                        }
                    >
                        <SpaceBetween direction="vertical" size="l">
                            <FormField label="Job Role"
                                errorText={isFormSubmitted && isEmptySelection(selectedRole) && 'Job Role is required.'}
                                i18nStrings={{
                                    errorIconAriaLabel: 'Error',
                                }}
                            >
                                <Multiselect
                                    selectedOptions={selectedRole}
                                    onChange={({ detail }) => setSelectedRole(detail.selectedOptions)}
                                    options={[
                                        { label: "Systems Engineer", value: "Systems Engineer" },
                                        { label: "Systems Development Engineer", value: "Systems Development Engineer" },
                                        { label: "Support Engineer", value: "Support Engineer" },
                                        { label: "Systems Analyst", value: "Systems Analyst" },
                                    ]}
                                    placeholder="Select the appropriate job role"
                                />
                            </FormField>
                            <FormField label="Question"
                                errorText={isFormSubmitted && isEmptyString(question) && 'Question is required.'}
                                i18nStrings={{
                                    errorIconAriaLabel: 'Error',
                                }}
                            >
                                <Input
                                    value={question}
                                    onChange={({ detail }) => setQuestion(detail.value)}
                                    type="text"
                                    placeholder="Enter the question"
                                />
                            </FormField>
                            <FormField label="Question Type"
                                errorText={isFormSubmitted && isEmptySelection(selectedType) && 'Role is required.'}
                                i18nStrings={{
                                    errorIconAriaLabel: 'Error',
                                }}
                            >
                                <Multiselect
                                    selectedOptions={selectedType}
                                    onChange={({ detail }) =>
                                        setSelectedType(detail.selectedOptions)
                                    }
                                    options={[
                                        { label: "Coding", value: "Coding" },
                                        { label: "Networking", value: "Networking" },
                                        { label: "Linux", value: "Linux" },
                                        { label: "Situational", value: "Situational" },
                                        { label: "Scripting", value: "Scripting" }
                                    ]}
                                    placeholder="Select the appropriate question type"
                                />
                            </FormField>
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            </Form>
        </form>
    );
}








// interface NewBodyProps {
//     roleOptions?: OptionDefinition[] | null;
//     questionLevel?: string;
// }



// export const Body = observer((props: NewBodyProps) => {
//     const newQuestionDataStore = useLocalObservable(NewQwizQuestionItemObservable);

//     function onSubmit(props: OnSubmitProps) {
//         const { questionDescription, selectedRole, questionLevels } = props;

//         const questionBody: NewQuestionBody = {
//             question: questionDescription ?? "",
//             data: {
//                 role: selectedRole as string,
//                 levels: questionLevels,
//                 ...newQuestionDataStore
//             }
//         };

//         uploadNewQuestion(questionBody)
//             .then((message) => {
//                 console.debug(message);
//                 location.href = "#/upload";
//             })
//             .catch(console.error);
//     }

//     function onCancel() {
//         location.href = "#/upload";
//     }

//     const formActions: FormActionProps = {
//         onSubmit,
//         onCancel
//     };

//     return (
//         <UploadQuestionForm
//             {...props}
//             questionDataStore={newQuestionDataStore}
//             formActions={formActions}
//         />
//     )
// })
