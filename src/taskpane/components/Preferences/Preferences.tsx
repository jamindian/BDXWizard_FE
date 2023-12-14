import React, { useCallback, useEffect, useState } from 'react';

import { FormLabel, Chip, Grid, Autocomplete, TextField, CircularProgress, Dialog, DialogTitle,
    DialogActions, Button, DialogContent,
} from '@mui/material';

import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import NetworkCalls from '@taskpane/services/ApiNetworkCalls';
import { IStagingAreaColumn, IUserProfile } from '@taskpaneutilities/Interface';
import { AlertsMsgs } from '@taskpaneutilities/Constants';
import { setLatestUserProfile } from '@redux/Actions/Process';

const Settings = () => {

    const dispatch = useDispatch();
    
    const [stagingColumns, setStagingColumns] = useState<{ selected: string[]; default: string[]; remaining: string[]; }>({ selected: [], default: [], remaining: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<string>("");
    const [settings, setSettings] = useState<any>(undefined);
    const [userPreferences, setUserPreferences] = useState<{ company_name: string; profile_name: string; poc_columns: string[]; }[]>([]);
    const [profile, setProfile] = useState<{ name: string; selected: string; }>({ name: "", selected: "" });

    useEffect(() => {
        initialRun();
    }, []);

    async function initialRun(): Promise<void> {
        const prefrences = await NetworkCalls.getAllUserPreference();
        const columnsResponse = await NetworkCalls.getStagingAreaColumnsForPOC();

        const p: IUserProfile[] = prefrences.data?.filter(f => f?.profile_name) ?? [];
        const StagingColumns: string[] = columnsResponse?.data?.map(c => c.column_name)?.filter(f => f !== "ID") ?? [];

        setUserPreferences(p);
        setProfile({ name: "", selected: p[p?.length - 1]?.profile_name });
        setStagingColumns({ default: StagingColumns, remaining: StagingColumns.filter(c => !p[p?.length - 1]?.poc_columns.includes(c)), selected: p[p?.length - 1]?.poc_columns });
        setLoading(false);
        dispatch(setLatestUserProfile(p[p?.length - 1]));
    }

    // Call redux action for save setting
    const saveCurrentSettings = useCallback(async (key: string) => {
        setBtnLoading(key);
        const u = await NetworkCalls.getCurrentActiveUser();
        const args = { company_name: u.data?.company_name, profile_name: profile.name, poc_columns: stagingColumns.selected };
        NetworkCalls.createUserPreference(args).then(async () => {
            toast.success('Preferences saved successfuly!');
            setBtnLoading("");
            
            const prefrences = await NetworkCalls.getAllUserPreference();
            setUserPreferences(prefrences.data ?? []);
            dispatch(setLatestUserProfile(args));
            setDialogOpen(false);
        }).catch(() => {
            toast.error(AlertsMsgs.somethingWentWrong);
            setBtnLoading("");
        });
    }, [stagingColumns, profile]);

    const onSettingsChange = useCallback((name: string, value: any[] | any) => {
        setSettings({ ...settings, [name]: value });
    }, [settings]);

    const onAddStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.remaining.filter(c => c !== _column), selected: [...stagingColumns.selected, _column] });
    }, [stagingColumns]);

    const onRemoveStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: [...stagingColumns.remaining, _column], selected: stagingColumns.selected.filter(c => c !== _column) });
    }, [stagingColumns]);

    const onChangeProfileSelection = useCallback((value: string) => {
        const selected: IUserProfile = userPreferences.find(f => f.profile_name === value);
        setProfile({ name: selected.profile_name, selected: value });
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.default.filter(c => !selected.poc_columns.includes(c)), selected: selected.poc_columns });
    }, [stagingColumns, userPreferences]);

    return (
        <form noValidate autoComplete='off'>
            
            <div className="control-group">
                <br />
                <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Autocomplete
                            disablePortal fullWidth
                            value={profile.selected as any[] | any}
                            onChange={(_e: any, value: any[] | any) => onChangeProfileSelection(value)}
                            options={userPreferences?.map(p => p.profile_name)} size="small"
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
                            {stagingColumns?.remaining?.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onClick={() => onAddStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            { loading ? ( <CircularProgress color="primary" size={16} /> ) : (
                                stagingColumns?.remaining?.length === 0 && <p className='m-0'>All columns are selected.</p>
                            )}
                        </div>
                    </div>
                    <div className="w-50">
                        <div className="control-group mt-0 h-100">
                            <FormLabel component="legend" className='thin'>Selected columns for automapping</FormLabel><br />
                            {stagingColumns?.selected?.map(column => (
                                <Chip key={column + "s"} variant="outlined" size="medium" label={column} onDelete={() => onRemoveStagingColumn(column)} style={{ margin: 3 }}
                                />
                            ))}
                            { loading ? ( <CircularProgress color="primary" size={16} /> ) : (
                                stagingColumns?.selected?.length === 0 && <p className='m-0'>No columns are selected.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='d-flex d-flex-row-center'>
                <CustomButton loading={btnLoading === "save"} onClick={() => saveCurrentSettings("save")} title="Save" />
                <CustomButton loading={btnLoading === "save_as"} onClick={() => setDialogOpen(true)} title="Save As" />
            </div>
            
            <Dialog
                open={dialogOpen} onClose={setDialogOpen} fullWidth={true} maxWidth={"xs"}
            >
                <DialogContent>
                    <br />
                    <TextField 
                        label="New Profile Name" name="new_profile_name" variant="outlined" value={profile.name} size="small"
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })} type="text" fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary"> Close </Button>
                    <Button onClick={() => profile.name && saveCurrentSettings("save_as")} color="primary"> Done </Button>
                </DialogActions>
            </Dialog>

        </form>
    )
};

export default Settings;