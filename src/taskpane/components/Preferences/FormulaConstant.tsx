// import React, { useState } from 'react';

// import { Grid, Autocomplete, TextField, Box, Menu, MenuItem } from '@mui/material';
// import { IBasicObject } from '@taskpaneutilities/Interface';
// import CommonMethods from '@taskpaneutilities/CommonMethods';

// interface IProps {
//     stagingColumns: string[];
//     staginConstants: IBasicObject;
//     setStaginConstants: (arg: IBasicObject) => void;
// }

// const FormulaConstant: React.FC<IProps> = ({ stagingColumns, staginConstants, setStaginConstants }) => {
    
//     const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
//     const open = Boolean(anchorEl);
//     const [basedOn, setBasedOn] = useState<string>("Constant Value");
//     const [activeColumn, setActiveColumn] = useState<string[]>([]);

//     React.useEffect(() => {
//         setActiveColumn(Object.keys(staginConstants));
//     }, []);

//     const onChangeInput = React.useCallback((k: string, v: string) => {
//         setStaginConstants({ ...staginConstants, [k]: v });
//     }, [staginConstants, basedOn]);

//     return (
//         <React.Fragment>
                    
//             <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
//                 <Grid item xs={6} sm={6} md={6} lg={6}>
//                     <Autocomplete
//                         fullWidth multiple limitTags={1} id="multiple-limit-tags" filterSelectedOptions
//                         value={activeColumn as any[] | any}
//                         onChange={(_e: any, value: any[] | any) => {
//                             setActiveColumn(value);
//                             setStaginConstants(CommonMethods.ObjectReset(staginConstants));
//                         }}
//                         options={stagingColumns} size="small" getOptionLabel={(option) => option}
//                         renderInput={(params) => <TextField {...params} label="Staging Area Columns" />}
//                     />
//                 </Grid>
//                 <Grid item xs={6} sm={6} md={6} lg={6}>
//                     { activeColumn.length > 0 ? (
//                         <Autocomplete
//                             disablePortal fullWidth
//                             value={basedOn as any[] | any}
//                             onChange={(_e: any, value: any[] | any) => {
//                                 setBasedOn(value);
//                                 setStaginConstants(CommonMethods.ObjectReset(staginConstants));
//                             }}
//                             options={["Constant Value", "Formula"]} size="small"
//                             getOptionLabel={(option) => option}
//                             renderInput={(params) => <TextField {...params} label="Based On" />}
//                         />
//                     ) : null }
//                 </Grid>
//             </Grid>
//             { activeColumn.length > 0 && basedOn && (
//                 <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
//                     { activeColumn.map((c) => (
//                         <Grid item xs={6} sm={6} md={6} lg={6} key={c}>
//                             { basedOn === "Formula" ? (
//                                 <div>
//                                     <TextField 
//                                         label={`${c} ${basedOn}`} name={`formula_columns_${c.toLowerCase().split(' ').join()}`} 
//                                         value={staginConstants[c]} size="small" className='mt-3' variant="outlined" type="text" fullWidth
//                                         onChange={(e) => onChangeInput(c, e.target.value)}
//                                         onKeyDown={(e) => {
//                                             if (e.ctrlKey && e.shiftKey) {
//                                                 setAnchorEl(e.currentTarget);
//                                             }
//                                         }}
//                                         id="staging-columns-menu"
//                                         aria-controls={open ? 'staging-columns-menu' : undefined}
//                                         aria-haspopup="true"
//                                         aria-expanded={open ? 'true' : undefined}
//                                     />
//                                     <Menu
//                                         id="staging-columns-menu" aria-labelledby="staging-columns-button"
//                                         anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}
//                                         anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
//                                         transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//                                         sx={{ maxHeight: 220 }}
//                                     >
//                                         { stagingColumns.map((column: string) => (
//                                             <MenuItem key={column} sx={{ fontSize: 14 }} onClick={() => {
//                                                 setAnchorEl(null);
//                                                 onChangeInput(c, staginConstants[c]+column);
//                                             }}>{column}</MenuItem>
//                                         ))}
//                                     </Menu>
//                                 </div>
//                             ) : (
//                                 <TextField 
//                                     label={`${c} ${basedOn}`} name={`search_columns_${c.toLowerCase().split(' ').join()}`} 
//                                     value={staginConstants[c]} size="small" className='mt-3' variant="outlined" type="text" fullWidth
//                                     onChange={(e) => onChangeInput(c, e.target.value)}
//                                 />
//                             ) }                            
//                         </Grid>
//                     )) }                    
//                 </Grid>
//             )}
//             <br />
        
//         </React.Fragment>
//     )
// };

// export default FormulaConstant;

import React from 'react';

import { Grid, Autocomplete, TextField, IconButton, Fab, FormLabel } from '@mui/material';
import { IStagingConstant } from '@taskpaneutilities/Interface';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface IProps {
    stagingColumns: string[];
    staginConstants: IStagingConstant[];
    setStaginConstants: (arg: IStagingConstant[]) => void;
    onDelete: (arg: IStagingConstant) => void;
}

const FormulaConstant: React.FC<IProps> = ({ stagingColumns, staginConstants, setStaginConstants, onDelete }) => {
    
    const handleRemoveClick = (index: number, c: string): void => {
        setStaginConstants(staginConstants.filter((_, i) => i !== index));
        onDelete({ columnName: c, constantValue: "" });
    };

    return (
        <React.Fragment>
            
            { staginConstants?.map((v, index: number) => (            
                <Grid key={v.columnName+index} container direction="row" justifyContent="space-between" alignItems="center" spacing={2} style={{ marginBottom: "15px" }}>
                    <Grid item xs={5} sm={5} md={5} lg={5}>
                        { index === 0 && (<FormLabel component="legend" className='bold'>Staging Area Columns</FormLabel>)}
                        <Autocomplete
                            fullWidth id="stagingcolumn" filterSelectedOptions
                            value={v.columnName as any[] | any}
                            onChange={(_e: any, value: any[] | any) => {
                                const dup = [...staginConstants];
                                dup[index] = { ...dup[index], columnName: value ? value : "" };
                                setStaginConstants([...dup]);
                            }}
                            options={stagingColumns.filter(f => !staginConstants.map(a => a.columnName).includes(f))} size="small" getOptionLabel={(option) => option}
                            renderInput={(params) => <TextField {...params} label="Column" />}
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6}>
                        { index === 0 && (<FormLabel component="legend" className='bold'>Constant Value</FormLabel>)}
                        <TextField 
                            label={`${v.columnName}`} name={`search_columns_${v.columnName.toLowerCase().split(' ').join()}`} 
                            value={v.constantValue} size="small" variant="outlined" type="text" fullWidth
                            onChange={(e) => {
                                const dup = [...staginConstants];
                                dup[index] = { ...dup[index], constantValue: e.target.value };
                                setStaginConstants([...dup]);
                            }}
                        />
                    </Grid>
                    <Grid item xs={1} sm={1} md={1} lg={1}>
                        <IconButton className="" color="secondary" onClick={() => handleRemoveClick(index, v.columnName)}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )) }

            <div className="d-flex justify-content-end">
                <div className="actions">
                    <Fab size="small" color="primary" aria-label="add" onClick={() => setStaginConstants([ ...staginConstants, { columnName: "", constantValue: "" } ])}>
                        <AddIcon />
                    </Fab>
                </div>
            </div>

            <br />        
        </React.Fragment>
    )
};

export default FormulaConstant;