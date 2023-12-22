import React, { useCallback, useEffect, useState } from 'react';

import { FormLabel, Chip, Grid, Autocomplete, TextField, CircularProgress, Dialog,
    DialogActions, Button, DialogContent, ListItem, ListItemText, DialogTitle, Divider, setRef
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
import CommonMethods from '@taskpaneutilities/CommonMethods';
import { adjustPreferenceStagingConstants, tryCatch } from '@taskpaneutilities/Helpers';

const Settings = () => {

    const dispatch = useDispatch();
    
    const [stagingColumns, setStagingColumns] = useState<{ selected: string[]; default: string[]; remaining: string[]; }>({ selected: [], default: [], remaining: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [createNew, setCreateNew] = useState<boolean>(false);
    const [selectionWithInSearch, setSelectionWithInSearch] = useState<{ add: string[]; remove: string[]; }>({ add: [], remove: [] });
    const [staginConstants, setStaginConstants] = useState<{ [key: string]: string; }>({});
    const [deletePreference, setDeletePreference] = useState<{ flag: boolean; id: number; }>({ flag: false, id: null });
    const [userPreferences, setUserPreferences] = useState<IUserProfile[]>([]);
    const [profile, setProfile] = useState<{ name: string; selected: string; id: number; poc_columns: string[] }>({ name: "", selected: "", id: null, poc_columns: [] });

    useEffect(() => {
        initialRun();
    }, []);

    async function initialRun(): Promise<void> {
        const prefrences = await NetworkCalls.getAllUserPreference();
        const columnsResponse = await NetworkCalls.getStagingAreaColumnsForPOC();

        const activeProfile: IUserProfile = prefrences.data?.find(f => f?.active) ?? prefrences.data[0];
        const StagingColumns: string[] = columnsResponse?.data?.map(c => c.column_name)?.filter(f => f !== "ID") ?? [];

        setUserPreferences(prefrences.data?.filter(f => f?.profile_name) ?? []);
        setProfile({ name: activeProfile?.profile_name, selected: activeProfile?.profile_name, id: activeProfile?.id, poc_columns: activeProfile?.poc_columns });
        setStaginConstants(activeProfile?.staging_constants ? activeProfile?.staging_constants : {});
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
            setCreateNew(false);
            
            const prefrences = await NetworkCalls.getAllUserPreference();
            setUserPreferences(prefrences.data ?? []);
            dispatch(setLatestUserProfile(prefrences.data?.find(f => f?.active)));
            setDialogOpen(false);

            if (Object.keys(staginConstants).length > 0) {
                tryCatch(adjustPreferenceStagingConstants(staginConstants));
            }
        }).catch(() => {
            toast.error(AlertsMsgs.somethingWentWrong);
            setBtnLoading("");
        });
    }, [stagingColumns, profile, staginConstants]);

    const onAddStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: CommonMethods.removeDublicatesInArray(stagingColumns.remaining.filter(c => c !== _column)), selected: CommonMethods.removeDublicatesInArray([...stagingColumns.selected, _column]) });
        if (search) {
            setSelectionWithInSearch({ ...selectionWithInSearch, add: [...selectionWithInSearch.add, _column] });
        }
    }, [stagingColumns, search, selectionWithInSearch]);

    const onRemoveStagingColumn = useCallback((_column: string) => {
        setStagingColumns({ ...stagingColumns, remaining: CommonMethods.removeDublicatesInArray([...stagingColumns.remaining, _column]), selected: CommonMethods.removeDublicatesInArray(stagingColumns.selected.filter(c => c !== _column)) });
        if (search) {
            setSelectionWithInSearch({ ...selectionWithInSearch, remove: [...selectionWithInSearch.remove, _column] });
        }
    }, [stagingColumns, search, selectionWithInSearch]);

    const onChangeProfileSelection = useCallback((value: string) => {
        const selected: IUserProfile = userPreferences.find(f => f.profile_name === value);
        setProfile({ name: selected.profile_name, selected: value, id: selected.id, poc_columns: selected?.poc_columns });
        setStagingColumns({ ...stagingColumns, remaining: stagingColumns.default.filter(c => !selected.poc_columns.includes(c)), selected: selected.poc_columns });
    }, [stagingColumns, userPreferences]);

    const onClickCreateNew = useCallback(async () => {
        const f: boolean = !createNew;
        if (f) {
            setUserPreferences([{ active: true, poc_columns: [], staging_constants: {}, id: 0, profile_name: "New Profile 1", company_name: userPreferences[0].company_name }, ...userPreferences.map(f => { return { ...f, active: false } })]);
            setProfile({ ...profile, poc_columns: [], id: 0, name: "New Profile 1", selected: "New Profile 1" });
            setStagingColumns({ ...stagingColumns, remaining: stagingColumns.default, selected: [] });
        } else {
            const prefrences = await NetworkCalls.getAllUserPreference();
            setUserPreferences(prefrences?.data ?? []);
            onChangeProfileSelection(prefrences?.data?.find(f => f?.active).profile_name);
        }
        setCreateNew(f);
    }, [stagingColumns, userPreferences, createNew]);

    return (
        <form noValidate autoComplete='off'>
            
            <div className="control-group">
                <br />
                <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        <Autocomplete
                            disablePortal fullWidth size="small"
                            value={profile.selected as any[] | any}
                            onChange={(_e: any, value: any[] | any) => {
                                onChangeProfileSelection(value);
                                setCreateNew(false);
                            }}
                            options={CommonMethods.removeDublicatesInArray(userPreferences?.map(p => p.profile_name))}
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
                        <Button onClick={() => onClickCreateNew()} color="primary"> { createNew ? "Reset" : "Create New" } </Button>
                    </Grid>
                </Grid>
            </div>
            <br />

            <div className="control-group">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <FormLabel component="legend" className='bold'>Staging area columns</FormLabel>
                    <TextField 
                        label="Search Columns" name="search_columns" variant="outlined" value={search} size="small"
                        onChange={(e) => {
                            const v: string = e.target.value;
                            setSearch(v);      
                            let obj = {
                                default: stagingColumns.default, 
                                remaining: stagingColumns.default.filter(c => !profile?.poc_columns.includes(c) && !selectionWithInSearch?.add.includes(c)) ?? [], 
                                selected: [...profile?.poc_columns, ...selectionWithInSearch.add].filter(c => !selectionWithInSearch?.remove.includes(c)) ?? []
                            }

                            if (v) {
                                obj = {
                                    ...stagingColumns, selected: stagingColumns.selected.filter(function (str) { return str.indexOf(v) !== -1; }),
                                    remaining: stagingColumns.remaining.filter(function (str) { return str.indexOf(v) !== -1; })
                                }
                            }

                            setStagingColumns(obj);
                        }} 
                        type="text" style={{ width: "70%", margin: "0 auto" }} disabled={loading}                        
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

            { stagingColumns.default.length > 0 && (
                <FormulaConstant stagingColumns={stagingColumns.default} setStaginConstants={setStaginConstants} staginConstants={staginConstants} />
            )}

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