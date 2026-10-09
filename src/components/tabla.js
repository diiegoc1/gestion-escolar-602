export function renderTabla(datos = []) { return <table><tbody> + datos.map(f => <tr><td> + f + </td></tr>).join('') + </tbody></table> }
