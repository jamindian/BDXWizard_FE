import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@mui/material';
import { FormLabel, Chip, Grid, Autocomplete, TextField, CircularProgress } from '@mui/material';

import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import { setLoader } from '@redux/Actions/Auth';
import NetworkCalls from '@taskpane/services/ApiNetworkCalls';
import { IStagingAreaColumn } from '@taskpaneutilities/Interface';

const Settings = () => {

    const dispatch = useDispatch();
    
    const [stagingColumns, setStagingColumns] = useState<{ selected: string[]; default: string[]; remaining: string[]; }>({ selected: [], default: [], remaining: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [settings, setSettings] = useState<any>(undefined);
    const [userPreferences, setUserPreferences] = useState<{ company_name: string; profile_name: string; poc_columns: string[]; }[]>([]);
    const [profile, setProfile] = useState<{ name: string; selected: string; }>({ name: "", selected: "" });

    useEffect(() => {
        async function run(): Promise<void> {
            const prefrences = await NetworkCalls.getAllUserPreference();
            const columnsResponse = await NetworkCalls.getStagingAreaColumnsForPOC();
            const StagingColumns: IStagingAreaColumn[] = columnsResponse?.data ?? [];
            setStagingColumns({ default: StagingColumns.map(c => c.column_name), selected: [], remaining: StagingColumns.map(c => c.column_name) });
            setUserPreferences(prefrences.data ?? []);
            setLoading(false);
        }
        
        run();
    }, []);

    // Call redux action for save setting
    const saveCurrentSettings = (): void => {
        const args = { ...settings };
        setLoading(true);
        dispatch(setLoader(true));
    };

    const onSettingsChange = useCallback((name: string, value: any[] | any) => {
        setSettings({ ...settings, [name]: value });
    }, [settings]);

    const onAddStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.default.filter(c => c !== _column), selected: [...stagingColumns.selected, _column] });
    }, [stagingColumns]);

    const onRemoveStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: [...stagingColumns.remaining, _column], selected: stagingColumns.selected.filter(c => c !== _column) });
    }, [stagingColumns]);

    const onChangeProfileSelection = useCallback((value: string) => {
        const selections: string[] = userPreferences.find(f => f.profile_name === value).poc_columns ?? [];
        setProfile({ ...profile, selected: value });
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.default.filter(c => !selections.includes(c)), selected: selections });
    }, [stagingColumns, userPreferences, profile]);

    return (
        <form noValidate autoComplete='off'>
            
            <div className="control-group">
                <br />
                <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        <TextField 
                            label="New Profile Name" name="new_profile_name" variant="outlined" value={profile.name} size="small"
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })} type="text" fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Autocomplete
                            disablePortal fullWidth
                            value={profile.selected as any[] | any}
                            onChange={(_e: any, value: any[] | any) => onChangeProfileSelection(value)}
                            options={userPreferences.map(p => p.profile_name)} size="small"
                            renderInput={(params) => <TextField {...params} label="Profiles" />}
                        />                   
                    </Grid>
                </Grid>
            </div>
            <br />
            <div className="control-group">
                <div className="d-flex justify-content-between align-items-center">
                    <FormLabel component="legend" className='bold'>Staging area columns</FormLabel>
                </div>
                <div className="control-wrapper d-flex justify-content-between">
                    <div className="w-50">
                        <div className="control-group mt-0 h-100">
                            <FormLabel component="legend" className='thin'>Columns yet to map</FormLabel><br />
                            {stagingColumns.remaining.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onClick={() => onAddStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            { loading ? ( <CircularProgress color="primary" size={16} /> ) : (
                                stagingColumns.remaining.length === 0 && <p className='m-0'>All columns are selected.</p>
                            )}
                        </div>
                    </div>
                    <div className="w-50">
                        <div className="control-group mt-0 h-100">
                            <FormLabel component="legend" className='thin'>Selected columns for mapping</FormLabel><br />
                            {stagingColumns.selected.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onDelete={() => onRemoveStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            { loading ? ( <CircularProgress color="primary" size={16} /> ) : (
                                stagingColumns.selected.length === 0 && <p className='m-0'>No columns are selected.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='d-flex d-flex-row-center'>
                <CustomButton loading={false} onClick={() => saveCurrentSettings()} title="Save" />
                <CustomButton loading={false} onClick={() => saveCurrentSettings()} title="Save As" />
            </div>
            
        </form>
    )
};

export default Settings;