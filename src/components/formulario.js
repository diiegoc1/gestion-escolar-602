export function renderFormulario(campos = []) { return <form> + campos.map(c => <input name=' + c + ' placeholder=' + c + '/>).join('') + </form> }
