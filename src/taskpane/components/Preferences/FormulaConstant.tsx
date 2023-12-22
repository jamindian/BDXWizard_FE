import React, { useState } from 'react';

import { Grid, Autocomplete, TextField } from '@mui/material';

interface IProps {
    stagingColumns: string[];
}

const FormulaConstant: React.FC<IProps> = ({ stagingColumns }) => {
    
    const [basedOn, setBasedOn] = useState<string>("");
    const [activeColumn, setActiveColumn] = useState<string[]>([]);
    const [input, setInput] = useState<string>("");

    return (
        <React.Fragment>
                    
            <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={4}>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                    <Autocomplete
                        fullWidth multiple limitTags={1} id="multiple-limit-tags" filterSelectedOptions
                        value={activeColumn as any[] | any}
                        onChange={(_e: any, value: any[] | any) => {
                            setActiveColumn(value);
                            setInput("");
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
                                setInput("");
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
                                label={`${c} ${basedOn}`} name="search_columns" variant="outlined" value={input} size="small"
                                onChange={(e) => setInput(e.target.value)} type="text" fullWidth className='mt-3'
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