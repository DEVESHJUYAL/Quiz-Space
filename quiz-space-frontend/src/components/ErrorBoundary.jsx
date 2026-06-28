import { Component } from "react"
export default class ErrorBoundary extends Component {
  constructor(props){super(props);this.state={hasError:false,error:null}}
  static getDerivedStateFromError(error){return{hasError:true,error}}
  render(){
    if(this.state.hasError)return(
      <div className="min-h-screen bg-cream-100 grid-pattern flex items-center justify-center px-4">
        <div className="card p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-3xl mx-auto mb-5">⚠️</div>
          <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
          <p className="text-stone-400 text-sm mb-6">{this.state.error?.message||"An unexpected error occurred"}</p>
          <button onClick={()=>window.location.reload()} className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">Reload Page</button>
        </div>
      </div>
    )
    return this.props.children
  }
}