import React, { useState } from 'react';

import { Grid, Autocomplete, TextField } from '@mui/material';

interface IProps {
    stagingColumns: string[];
    staginConstants: { [key: string]: string; };
    setStaginConstants: (arg: { [key: string]: string; }) => void;
}

const FormulaConstant: React.FC<IProps> = ({ stagingColumns, staginConstants, setStaginConstants }) => {
    
    const [basedOn, setBasedOn] = useState<string>("");
    const [activeColumn, setActiveColumn] = useState<string[]>([]);

    const onChangeInput = React.useCallback((k: string, v: string) => {
        setStaginConstants({ ...staginConstants, [k]: v });
    }, [staginConstants]);

    return (
        <React.Fragment>
                    
            <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                    <Autocomplete
                        fullWidth multiple limitTags={1} id="multiple-limit-tags" filterSelectedOptions
                        value={activeColumn as any[] | any}
                        onChange={(_e: any, value: any[] | any) => {
                            setActiveColumn(value);
                            setStaginConstants({});
                        }}
                        options={stagingColumns} size="small" getOptionLabel={(option) => option}
                        renderInput={(params) => <TextField {...params} label="Staging Area Columns" />}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                    { activeColumn.length > 0 ? (
                        <Autocomplete
                            disablePortal fullWidth
                            value={basedOn as any[] | any}
                            onChange={(_e: any, value: any[] | any) => {
                                setBasedOn(value);
                                setStaginConstants({});
                            }}
                            options={["Constant Value", "Formula"]} size="small"
                            getOptionLabel={(option) => option}
                            renderInput={(params) => <TextField {...params} label="Based On" />}
                        />
                    ) : null }
                </Grid>
            </Grid>
            { activeColumn.length > 0 && basedOn && (
                <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                    { activeColumn.map((c) => (
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField 
                                label={`${c} ${basedOn}`} name={`search_columns_${c.toLowerCase().split(' ').join()}`} 
                                value={staginConstants[c]} size="small" className='mt-3' variant="outlined" type="text" fullWidth
                                onChange={(e) => onChangeInput(c, e.target.value)}
                            />
                        </Grid>
                    )) }                    
                </Grid>
            )}
            <br />
        
        </React.Fragment>
    )
};

export default FormulaConstant;