import { useState } from "react"
import { uploadSolution, deleteSolution } from "../services/solutionService"

export default function SolutionUploader({ quizId, solutions, onUpdate }) {
  const [uploading,setUploading]=useState(false),[caption,setCaption]=useState("")
  const [preview,setPreview]=useState(null),[file,setFile]=useState(null),[dragOver,setDragOver]=useState(false)
  const [uploadError,setUploadError]=useState("")

  const handleFile=f=>{if(!f)return;setFile(f);setPreview(URL.createObjectURL(f))}
  const handleDrop=e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0])}
  const handleUpload=async()=>{
    if(!file)return;setUploading(true)
    try{
      const fd=new FormData();fd.append("file",file);if(caption)fd.append("caption",caption)
      const r=await uploadSolution(quizId,fd);onUpdate([...solutions,r.data])
      setFile(null);setPreview(null);setCaption("")
    }catch{setUploadError("Upload failed. Please try again.")}finally{setUploading(false)}
  }
  const handleDelete=async id=>{if(!window.confirm("Delete?"))return;await deleteSolution(id);onUpdate(solutions.filter(s=>s.id!==id))}

  return(
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-stone-900 mb-1">Whiteboard Solutions</h3>
        <p className="text-xs text-stone-400">Upload photos of handwritten solutions for students to review</p>
      </div>

      <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragOver?"border-indigo-400 bg-indigo-50":"border-stone-200 hover:border-indigo-300 hover:bg-indigo-50 hover:bg-opacity-50"}`}>
        {preview?(
          <div className="space-y-4">
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain"/>
              <button onClick={()=>{setPreview(null);setFile(null)}} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center">×</button>
            </div>
            <input type="text" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Add a caption (optional)" className="input-field w-full rounded-xl px-4 py-2.5 text-sm"/>
            <div className="flex gap-3">
              <button onClick={()=>{setPreview(null);setFile(null)}} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                {uploading?(
                  <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading...</span>
                ):"Upload ↑"}
              </button>
            </div>
            {uploadError&&<p className="text-xs text-rose-500 text-center mt-1">⚠ {uploadError}</p>}
          </div>
        ):(
          <label className="cursor-pointer block">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mx-auto mb-4">📷</div>
            <p className="text-sm text-stone-600 font-medium mb-1">Drop image here or click to upload</p>
            <p className="text-xs text-stone-400">PNG, JPG up to 10MB</p>
            <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} className="hidden"/>
          </label>
        )}
      </div>

      {solutions.length>0&&(
        <div>
          <p className="text-xs text-stone-400 mb-3 font-medium uppercase tracking-wider">{solutions.length} Solution{solutions.length>1?"s":""} Uploaded</p>
          <div className="grid grid-cols-2 gap-3">
            {solutions.map((sol,i)=>(
              <div key={sol.id} className="relative group card overflow-hidden">
                <img src={sol.imageUrl} alt={sol.caption} className="w-full h-40 object-cover"/>
                {sol.caption&&<p className="text-xs text-stone-500 p-3 border-t border-stone-100">{sol.caption}</p>}
                <button onClick={()=>handleDelete(sol.id)} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full text-stone-500 text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-soft hover:text-rose-500">×</button>
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-lg px-2 py-0.5 text-xs text-stone-600 font-medium shadow-soft">{i+1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}