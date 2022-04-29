import React from 'react';
import { useState } from 'react';

function TableFilter(props) {
    const { data, textFilter, headerTitle, onRowClick, title, rowFila } = props;
    const LongData = data.length
    console.log(LongData)
    const [currentPage, setcurrentPage] = useState(0);
    const [ search, setsearch ] = useState('');

    const RowFile = () =>{
        if ( search.length == 0 )
            return data.slice(currentPage, rowFila ? currentPage + rowFila : currentPage +5)

        const filtered = data.filter( items => items.secuencia.includes( search ) )
        return filtered.slice(currentPage, rowFila ? currentPage + rowFila : currentPage +5)
    }
    const nextPage = () => {
        if ( currentPage <= LongData ){
            let diff = LongData - currentPage
            if(diff > rowFila){
                setcurrentPage( currentPage + rowFila)
            }
        }
    }
    const prevPage = () => {
        if ( currentPage > 0 )
            setcurrentPage( currentPage - rowFila)
    }
    const onChangeSearch = (event) => {
        setcurrentPage( 0 )
        setsearch(event.target.value)
    }
    const TonRowClick = (rows) =>{
        return rows
    }

    return (
        <>
            <h1>{title}</h1>
            <input 
                type="text"
                className="mb-2 form-control"
                placeholder="Buscardor...."
                style={{
                    maxWidth:'40%',
                    outline: 'none',
                }}
                value={ search }
                onChange={(event)=>onChangeSearch(event)}
            />
            <table className="table">
                <thead>
                    <tr>
                        { 
                            headerTitle ?
                            headerTitle.map(items =>(
                                <th>{items.label}</th>
                            )):''                      
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data ?
                        RowFile().map((items, index) =>(
                            <tr>
                            {
                                headerTitle.map((hear, index)=>(
                                    hear.click == true 
                                    ?<td onClick={()=>onRowClick(items)}>{items[headerTitle[index].id]}</td>
                                    :<td >{items[headerTitle[index].id]}</td>
                                )) 
                            }
                        </tr>
                        )): ''
                    }
                </tbody>
            </table>
            <div className="d-flex justify-content-end m-3">
            <button className="btn btn-primary btn-md" onClick={ prevPage }> {"<"} </button>
            &nbsp;
            <button className="btn btn-primary btn-md" onClick={ nextPage }> {">"} </button>
            </div>
        </>
    );
}

export default TableFilter;