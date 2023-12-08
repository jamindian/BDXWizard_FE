import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import { FormLabel, Chip } from '@mui/material';

import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import { setLoader } from '@redux/Actions/Auth';
import NetworkCalls from '@taskpane/services/ApiNetworkCalls';
import { IStagingAreaColumn } from '@taskpaneutilities/Interface';

const Settings = () => {

    const dispatch = useDispatch();
    
    const [stagingColumns, setStagingColumns] = useState<{ selected: string[]; default: string[]; }>({ selected: [], default: [] });
    const [loading, setLoading] = useState<boolean>(false);
    const [settings, setSettings] = useState<any>(undefined);
    const [selectedGeoCoders, setSelectedGeoCoders] = useState<string[]>([]);

    useEffect(() => {
        async function run(): Promise<void> {
            const columnsResponse = await NetworkCalls.getStagingAreaColumnsForPOC();
            const StagingColumns: IStagingAreaColumn[] = columnsResponse?.data ?? [];
            setStagingColumns({ default: StagingColumns.map(c => c.column_name), selected: [] });
        }
        
        run();
    }, []);

    // Call redux action for save setting
    const saveCurrentSettings = (): void => {
        const args = { ...settings, geocode_preferences: selectedGeoCoders };
        setLoading(true);
        dispatch(setLoader(true));
    };

    const onSettingsChange = useCallback((name: string, value: any[] | any) => {
        setSettings({ ...settings, [name]: value });
    }, [settings]);

    //Staging area columns section
    // function to select columns to map in staging area
    const onAddStagingColumn = (column: string) => {
        // let getFiltered = filteredColumns.filter((_column) => _column !== column);
        // setFilteredColumns(getFiltered);
        // let columns = [...settings.staging_area_columns_to_map];
        // setSettings({ ...settings, staging_area_columns_to_map: [...columns, column] });
    };

    // function to remove columns from selected to map in staging area
    const onRemoveStagingColumn = (column: string): void => {
        // let getFiltered = settings.staging_area_columns_to_map.filter((_column) => _column !== column);
        // setSettings({ ...settings, staging_area_columns_to_map: [...getFiltered] });
        // setFilteredColumns([...filteredColumns, column]);
    };

    // function to get system default columns to map in staging area
    const getSystemDefaults = (): void => {
        setStagingColumns({ ...stagingColumns, selected: stagingColumns.default });
    };

    return (
        <form noValidate autoComplete='off'>
            
            <div className="control-group">
                <br />
                <div className="d-flex justify-content-between align-items-center">
                    <FormLabel component="legend" className='bold'>Staging area columns</FormLabel>
                    <Button onClick={getSystemDefaults} variant="outlined" color="primary" style={{ minWidth: 210 }}>Use System Defaults</Button>
                </div><br />
                <div className="control-wrapper d-flex justify-content-between">
                    <div className="w-50">
                        <div className="control-group mt-0 h-100">
                            <FormLabel component="legend" className='thin'>Columns yet to map</FormLabel><br />
                            {stagingColumns.default.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onClick={() => onAddStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            {stagingColumns.default.length === 0 && <p className='m-0'>All columns are selected.</p>}
                        </div>
                    </div>
                    <div className="w-50">
                        <div className="control-group mt-0 h-100">
                            <FormLabel component="legend" className='thin'>Selected columns for mapping</FormLabel><br />
                            {stagingColumns.selected.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onDelete={() => onRemoveStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            {stagingColumns.selected.length === 0 && <p className='m-0'>No columns are selected.</p>}
                        </div>
                    </div>
                </div>
            </div>
            
            <CustomButton loading={loading} onClick={() => saveCurrentSettings()} title="Save" />
            
        </form>
    )
};

export default Settings;