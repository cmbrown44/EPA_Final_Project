import React, { useEffect, useState } from 'react';
import * as CS from '@cloudscape-design/components';
import * as Collection from '@cloudscape-design/collection-hooks';
import qwizStore from '../../../store/qwizStore';
import { observer } from 'mobx-react-lite';
import { createApiPath } from '../../../utils/helpers'
import * as localisation from "../../../localisation";

type TableRows = {
    rowId: number,
    role: string,
    question: string,
    type: string
}

export const QuestionTable = observer(() => {

    const [selectedTableRows, setSelectedTableRows] = React.useState<
        TableRows[]
    >([]);

    const url = createApiPath()

    useEffect(() => {
        qwizStore.fetchDataFromApi(url + '/question')
    }, []);

    const tableRows: TableRows[] = qwizStore.data.map((item, index): TableRows => ({

        rowId: index,
        role: item.role,
        question: item.question,
        type: item.type
    }));

    const collection = Collection.useCollection(tableRows, {
        propertyFiltering: {

            filteringProperties: [
                {
                    key: "jobRole",
                    operators: ["="],
                    propertyLabel: "Job Role",
                    groupValuesLabel: "Job Role",

                }
            ],
        },
        sorting: {
            defaultState:
            {
                isDescending: false,
                sortingColumn: {
                    sortingField: "Job Role"
                }
            }
        }
    });

    const counter =
        selectedTableRows.length === 0
            ? `(${tableRows.length.toString()})`
            : `(${selectedTableRows.length}/${tableRows.length})`;


    return (
        <CS.Table
            items={collection.items}
            onSelectionChange={(x) => {
                setSelectedTableRows(x.detail.selectedItems);
            }}
            selectedItems={selectedTableRows}
            columnDefinitions={[
                {
                    id: "jobRole",
                    header: "Job Role",
                    cell: (e: TableRows) => {
                        return e.role;
                    },
                },
                {
                    id: "question",
                    header: "Question",
                    cell: (e: TableRows) => {
                        return e.question;
                    },
                },
                {
                    id: "type",
                    header: "Type",
                    cell: (e: TableRows) => {
                        return e.type;
                    },
                    minWidth: 170,
                    maxWidth: 240,
                    sortingField: "type",
                },
            ]}
            loadingText="Loading training"
            trackBy="rowId"
            wrapLines
            selectionType="multi"
            filter={
                <CS.PropertyFilter
                    {...collection.propertyFilterProps}
                    countText={"Results: " + collection.filteredItemsCount}
                    i18nStrings={localisation.CSPropertyFilter}
                />
            }
            empty={
                <CS.Box
                    margin={{ vertical: "xs" }}
                    textAlign="center"
                    color="inherit"
                >
                    <CS.SpaceBetween size="m">
                        <b>No resources</b>
                        <CS.Button>Create resource</CS.Button>
                    </CS.SpaceBetween>
                </CS.Box>
            }
            header={counter}
        />
    )
});


