import React, { useCallback, useEffect, useState } from 'react';

import { FormLabel, Chip, Grid, Autocomplete, TextField, CircularProgress, Dialog,
    DialogActions, Button, DialogContent, ListItem, ListItemText, DialogTitle, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import NetworkCalls from '@taskpane/services/ApiNetworkCalls';
import { IUserProfile } from '@taskpaneutilities/Interface';
import { AlertsMsgs } from '@taskpaneutilities/Constants';
import { setLatestUserProfile } from '@redux/Actions/Process';
import FormulaConstant from './FormulaConstant';

const Settings = () => {

    const dispatch = useDispatch();
    
    const [stagingColumns, setStagingColumns] = useState<{ selected: string[]; default: string[]; remaining: string[]; }>({ selected: [], default: [], remaining: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [createNew, setCreateNew] = useState<boolean>(false);
    const [staginConstants, setStaginConstants] = useState<{ [key: string]: string; }>({});
    const [deletePreference, setDeletePreference] = useState<{ flag: boolean; id: number; }>({ flag: false, id: null });
    const [userPreferences, setUserPreferences] = useState<IUserProfile[]>([]);
    const [profile, setProfile] = useState<{ name: string; selected: string; id: number; }>({ name: "", selected: "", id: null });

    useEffect(() => {
        initialRun();
    }, []);

    useEffect(() => {
        if (search) {
            setStagingColumns({
                ...stagingColumns, selected: stagingColumns.default.filter(f => search ? f.includes(search) : f),
                remaining: stagingColumns.default.filter(f => search ? f.includes(search) : f)
            });
        }
    }, [search]);

    async function initialRun(): Promise<void> {
        const prefrences = await NetworkCalls.getAllUserPreference();
        const columnsResponse = await NetworkCalls.getStagingAreaColumnsForPOC();

        const activeProfile: IUserProfile = prefrences.data?.find(f => f?.active) ?? prefrences.data[0];
        const StagingColumns: string[] = columnsResponse?.data?.map(c => c.column_name)?.filter(f => f !== "ID") ?? [];

        setUserPreferences(prefrences.data?.filter(f => f?.profile_name) ?? []);
        setProfile({ name: activeProfile?.profile_name, selected: activeProfile?.profile_name, id: activeProfile?.id });
        setStaginConstants(Object.keys(activeProfile.staging_constants).length > 0 ? activeProfile.staging_constants : {});
        setStagingColumns({ default: StagingColumns, remaining: StagingColumns.filter(c => !activeProfile?.poc_columns.includes(c)) ?? [], selected: activeProfile?.poc_columns ?? [] });
        setLoading(false);
        dispatch(setLatestUserProfile(activeProfile));
    }

    // Call redux action for save setting
    const saveCurrentSettings = useCallback(async (key: string) => {
        setBtnLoading(key);
        const u = await NetworkCalls.getCurrentActiveUser();

        NetworkCalls.createUserPreference({ 
            company_name: u.data?.company_name, profile_name: profile.name, poc_columns: stagingColumns.selected,
            staging_constants: staginConstants
        }).then(async () => {
            toast.success('Preference saved successfuly!');
            setBtnLoading("");
            
            const prefrences = await NetworkCalls.getAllUserPreference();
            setUserPreferences(prefrences.data ?? []);
            dispatch(setLatestUserProfile(prefrences.data?.find(f => f?.active)));
            setDialogOpen(false);
        }).catch(() => {
            toast.error(AlertsMsgs.somethingWentWrong);
            setBtnLoading("");
        });
    }, [stagingColumns, profile, staginConstants]);

    const onAddStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.remaining.filter(c => c !== _column), selected: [...stagingColumns.selected, _column] });
    }, [stagingColumns]);

    const onRemoveStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: [...stagingColumns.remaining, _column], selected: stagingColumns.selected.filter(c => c !== _column) });
    }, [stagingColumns]);

    const onChangeProfileSelection = useCallback((value: string) => {
        const selected: IUserProfile = userPreferences.find(f => f.profile_name === value);
        setProfile({ name: selected.profile_name, selected: value, id: selected.id });
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
                            getOptionLabel={(option) => option}
                            renderOption={(props, option) => (
                                <ListItem
                                    {...props}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" size="small" onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletePreference({ flag: true, id: userPreferences.find(p => p.profile_name === option).id });
                                        }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={option} secondary={""} />
                                </ListItem>
                            )}
                            renderInput={(params) => <TextField {...params} label="Profiles" />}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Button onClick={() => setCreateNew(!createNew)} color="primary"> { createNew ? "Reset" : "Create New" } </Button>
                    </Grid>
                </Grid>
            </div>
            <br />

            <div className="control-group">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <FormLabel component="legend" className='bold'>Staging area columns</FormLabel>
                    <TextField 
                        label="Search Columns" name="search_columns" variant="outlined" value={search} size="small"
                        onChange={(e) => setSearch(e.target.value)} type="text" style={{ width: "70%", margin: "0 auto" }}
                        disabled={loading}
                    />
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

            <Divider />
            <br />

            <FormulaConstant stagingColumns={stagingColumns.default} setStaginConstants={setStaginConstants} staginConstants={staginConstants} />

            <div className='d-flex d-flex-row-center'>
                <CustomButton loading={btnLoading === "save"} onClick={() => !createNew && saveCurrentSettings("save")} title="Save" />
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

            <Dialog
                open={deletePreference.flag} onClose={() => setDeletePreference({ flag: false, id: null })} fullWidth={true} maxWidth={"xs"}
            >
                <DialogTitle>Delete Preference</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this preference?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletePreference({ flag: false, id: null })} color="primary"> Close </Button>
                    <Button onClick={() => deletePreference.id && NetworkCalls.deleteUserPreference(deletePreference.id).then(() => {
                        toast.success('Preferences has been deleted successfuly!');
                        setDeletePreference({ flag: false, id: null });
                        initialRun();
                    }).catch(() => {
                        toast.error(AlertsMsgs.somethingWentWrong);
                    })} color="primary"> Delete </Button>
                </DialogActions>
            </Dialog>

        </form>
    )
};

export default Settings;