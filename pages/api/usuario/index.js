
export default async (req, res)=>{
    try {
        const { username, password } = req.body;
        res.json({username, password, success: true})
        
    } catch (error) {
        console.log(error);
    }
}

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
//git clone https://DarioMarret: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@github.com/DarioMarret/sistema_tienda.git