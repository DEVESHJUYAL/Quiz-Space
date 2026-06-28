import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

function useCountUp(target, duration=1800, start=false) {
  const [val,setVal]=useState(0)
  useEffect(()=>{
    if(!start)return
    let frame; const t0=performance.now()
    const tick=now=>{const p=Math.min((now-t0)/duration,1),e=1-Math.pow(1-p,3);setVal(Math.floor(e*target));if(p<1)frame=requestAnimationFrame(tick)}
    frame=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(frame)
  },[target,duration,start])
  return val
}

function TiltCard({children,className=""}) {
  const ref=useRef(null)
  const onMove=e=>{const el=ref.current;if(!el)return;const r=el.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-0.5)*14,y=-((e.clientY-r.top)/r.height-0.5)*14;el.style.transform=`perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`}
  const onLeave=()=>{if(ref.current)ref.current.style.transform="perspective(900px) rotateX(0) rotateY(0) translateY(0)"}
  return<div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`transition-transform duration-300 ease-out ${className}`} style={{transformStyle:"preserve-3d"}}>{children}</div>
}

function FadeIn({children,delay=0,className=""}) {
  const ref=useRef(null),[vis,setVis]=useState(false)
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true)},{threshold:0.12});if(ref.current)o.observe(ref.current);return()=>o.disconnect()},[])
  return<div ref={ref} className={`transition-all duration-700 ${vis?"opacity-100 translate-y-0":"opacity-0 translate-y-8"} ${className}`} style={{transitionDelay:`${delay}ms`}}>{children}</div>
}

function FAQ({q,a}) {
  const [open,setOpen]=useState(false)
  return(
    <div className={`faq-item rounded-2xl overflow-hidden transition-all ${open?"border-indigo-200":""}`}>
      <button onClick={()=>setOpen(!open)} className="w-full flex justify-between items-center px-6 py-4 text-left gap-4">
        <span className={`text-sm font-semibold transition-colors ${open?"text-indigo-600":"text-stone-800"}`}>{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all ${open?"border-indigo-300 text-indigo-500 bg-indigo-50 rotate-180":"border-stone-200 text-stone-400"}`}>▾</span>
      </button>
      {open&&<div className="px-6 pb-5 text-sm text-stone-500 leading-relaxed border-t border-stone-100 pt-4">{a}</div>}
    </div>
  )
}

export default function LandingPage() {
  const [menuOpen,setMenuOpen]=useState(false),[statsVis,setStatsVis]=useState(false)
  const statsRef=useRef(null)
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStatsVis(true)},{threshold:0.3});if(statsRef.current)o.observe(statsRef.current);return()=>o.disconnect()},[])
  const s1=useCountUp(5000,1600,statsVis),s2=useCountUp(1200,1600,statsVis),s3=useCountUp(98,1400,statsVis)

  return(
    <div className="min-h-screen bg-cream-100 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/>
              <path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
              <line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
              <circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
            <span className="font-display text-xl font-bold text-stone-900">QuizSpace</span>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-500">
            {[["#features","Features"],["#how-it-works","How It Works"],["#roles","For You"],["#faq","FAQ"]].map(([h,l])=>(
              <a key={h} href={h} className="hover:text-stone-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium">Sign in</Link>
            <Link to="/register" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">Get Started →</Link>
          </div>
          <button className="md:hidden p-2 rounded-xl hover:bg-stone-100" onClick={()=>setMenuOpen(!menuOpen)}>
            <div className="w-5 space-y-1.5">{[menuOpen?"rotate-45 translate-y-2":"",menuOpen?"opacity-0":"",menuOpen?"-rotate-45 -translate-y-2":""].map((cls,i)=><span key={i} className={`block h-0.5 bg-stone-600 transition-all origin-center ${cls}`}/>)}</div>
          </button>
        </div>
        {menuOpen&&(
          <div className="md:hidden absolute top-full left-0 right-0 bg-cream-50 border-b border-stone-200 px-6 py-4 space-y-1 shadow-lifted">
            {[["#features","Features"],["#how-it-works","How It Works"],["#roles","For You"],["#faq","FAQ"]].map(([h,l])=>(
              <a key={h} href={h} onClick={()=>setMenuOpen(false)} className="block text-sm text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-100">{l}</a>
            ))}
            <div className="flex gap-3 pt-3 border-t border-stone-200 mt-2">
              <Link to="/login" onClick={()=>setMenuOpen(false)} className="flex-1 btn-secondary rounded-xl py-2.5 text-sm font-medium text-center">Sign in</Link>
              <Link to="/register" onClick={()=>setMenuOpen(false)} className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden grid-pattern">
        <div className="orb w-[600px] h-[600px] bg-indigo-200 opacity-40 top-[-150px] right-[-150px]" style={{animationDuration:"14s"}}/>
        <div className="orb w-[400px] h-[400px] bg-violet-200 opacity-30 bottom-[-80px] left-[-80px]" style={{animationDuration:"17s",animationDelay:"-6s"}}/>
        <div className="orb w-64 h-64 bg-amber-100 opacity-50 top-[40%] left-[40%]" style={{animationDuration:"11s",animationDelay:"-3s"}}/>
        {/* Floating shapes */}
        <div className="absolute top-32 right-[8%] w-20 h-20 border-2 border-indigo-200 rounded-3xl rotate-12 animate-spin" style={{animationDuration:"24s"}}/>
        <div className="absolute top-56 left-[5%] w-12 h-12 border-2 border-amber-200 rounded-2xl animate-spin" style={{animationDuration:"18s",animationDirection:"reverse"}}/>
        <div className="absolute bottom-24 right-[15%] w-8 h-8 bg-violet-200 rounded-xl rotate-45 animate-bounce" style={{animationDuration:"3s"}}/>
        <div className="absolute top-40 left-[22%] w-4 h-4 bg-indigo-300 rounded-full opacity-60 animate-ping" style={{animationDuration:"2.5s"}}/>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-5 py-2 text-indigo-600 text-xs font-semibold mb-8 animate-slide-up">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>The smartest quiz platform for classrooms
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 leading-tight mb-6 animate-slide-up" style={{animationDelay:"0.1s"}}>
            Build. Assign.<br/><span className="text-gradient">Analyse.</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{animationDelay:"0.2s"}}>
            QuizSpace lets teachers create smart quizzes with anti-cheat protection, assign them to specific students, and track results with powerful analytics — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{animationDelay:"0.3s"}}>
            <Link to="/register" className="btn-primary px-8 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 justify-center">Start for Free →</Link>
            <a href="#how-it-works" className="btn-secondary px-8 py-4 rounded-xl font-semibold text-base inline-flex items-center gap-2 justify-center text-stone-700">See How It Works</a>
          </div>

          {/* Hero mockup */}
          <FadeIn delay={300}>
            <TiltCard className="max-w-3xl mx-auto">
              <div className="card overflow-hidden border border-stone-100">
                <div className="bg-stone-50 px-4 py-3 flex items-center gap-2 border-b border-stone-100">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-300"/><div className="w-3 h-3 rounded-full bg-amber-300"/><div className="w-3 h-3 rounded-full bg-emerald-300"/></div>
                  <div className="flex-1 mx-4 bg-white rounded-lg px-3 py-1 text-xs text-stone-400 text-center border border-stone-200">quizspace.app/dashboard</div>
                </div>
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop" alt="Dashboard preview" className="w-full h-64 sm:h-80 object-cover object-top" style={{filter:"brightness(0.6) saturate(0.5)"}}/>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-60"/>
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <div><div className="text-stone-900 font-display font-bold text-base">My Quizzes</div><div className="text-stone-500 text-xs mt-0.5">3 published · 2 drafts</div></div>
                      <div className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold">+ New Quiz</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[{t:"Algebra Ch.5",b:"● Live",c:"from-indigo-500 to-violet-600"},{t:"Wave Optics",b:"○ Draft",c:"from-amber-400 to-orange-500"},{t:"Cell Biology",b:"● Live",c:"from-emerald-500 to-teal-600"}].map(c=>(
                        <div key={c.t} className="bg-white rounded-xl overflow-hidden shadow-soft">
                          <div className={`bg-gradient-to-br ${c.c} p-3`}><div className="text-base mb-1">📚</div><div className="text-white text-xs font-bold">{c.t}</div></div>
                          <div className="p-2 flex justify-between"><span className="text-xs text-stone-500">{c.b}</span><span className="text-xs text-stone-300">15Q</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </FadeIn>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="py-20 px-6 border-y border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[[s1,"+ students","text-indigo-600"],[s2,"+ quizzes","text-violet-600"],[s3,"% uptime","text-emerald-600"]].map(([v,suf,c],i)=>(
            <div key={i}><div className={`font-display text-5xl font-bold ${c} mb-1`}>{v.toLocaleString()}{suf}</div><div className="text-sm text-stone-400">{["Registered students","Quizzes created","Platform reliability"][i]}</div></div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 relative overflow-hidden">
        <div className="orb w-[400px] h-[400px] bg-indigo-100 opacity-50 top-0 right-[-80px]" style={{animationDuration:"15s"}}/>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">✦ Features</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">Everything you need to <span className="text-gradient">run great quizzes</span></h2>
              <p className="text-stone-400 max-w-xl mx-auto">From creating to analysing, QuizSpace handles the full lifecycle of a quiz.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {icon:"✏️",title:"4 Question Types",desc:"MCQ, True/False, Short Answer, and Fill-in-the-Blank. Build varied assessments that test real understanding.",bg:"bg-indigo-50",border:"border-indigo-100"},
              {icon:"🔒",title:"Student Restrictions",desc:"Assign quizzes to specific students by email. Only invited students can see and attempt the quiz.",bg:"bg-violet-50",border:"border-violet-100"},
              {icon:"⏱",title:"Live Countdown Timer",desc:"Real-time server-synced timer with automatic submission when time runs out.",bg:"bg-amber-50",border:"border-amber-100"},
              {icon:"🛡",title:"Anti-Cheat Detection",desc:"Tracks tab switches, fullscreen exits, and DevTools opens. Full report visible to teachers.",bg:"bg-rose-50",border:"border-rose-100"},
              {icon:"📊",title:"Instant Analytics",desc:"Per-question correct rates, high/low/avg scores, pass rate — all auto-calculated.",bg:"bg-emerald-50",border:"border-emerald-100"},
              {icon:"📷",title:"Whiteboard Solutions",desc:"Upload photos of handwritten solutions. Students can review them after the quiz.",bg:"bg-sky-50",border:"border-sky-100"},
              {icon:"🔑",title:"Join by Code",desc:"Students join with an 8-character code — no complicated links needed.",bg:"bg-orange-50",border:"border-orange-100"},
              {icon:"📋",title:"Submission Review",desc:"Expand any student submission and see their answer to every question side by side.",bg:"bg-pink-50",border:"border-pink-100"},
              {icon:"⚡",title:"Instant Results",desc:"Students see score, correct/wrong breakdown, and marks the moment they submit.",bg:"bg-teal-50",border:"border-teal-100"},
            ].map((f,i)=>(
              <FadeIn key={f.title} delay={i%3*100}>
                <TiltCard>
                  <div className={`card hover-lift h-full p-6 border ${f.border}`}>
                    <div className={`w-11 h-11 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center text-2xl mb-4`}>{f.icon}</div>
                    <h3 className="font-display font-bold text-stone-900 text-base mb-2">{f.title}</h3>
                    <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
                  </div>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] bg-violet-100 opacity-50 bottom-0 left-[-60px]" style={{animationDuration:"13s"}}/>
        <div className="max-w-6xl mx-auto">
          <FadeIn><div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">✦ For You</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">Built for <span className="text-gradient">teachers & students</span></h2>
          </div></FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {role:"Teacher",icon:"👩‍🏫",img:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop",color:"text-indigo-600",bg:"bg-indigo-600",check:"bg-indigo-50 border-indigo-100 text-indigo-600",items:["Create quizzes with 4 question types","Restrict access to specific students","Publish with a shareable 8-character code","Review every student's answers in detail","Get per-question analytics automatically","Upload handwritten solution photos"]},
              {role:"Student",icon:"🎓",img:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop",color:"text-violet-600",bg:"bg-violet-600",check:"bg-violet-50 border-violet-100 text-violet-600",items:["Join any quiz with an 8-character code","See your score the moment you submit","Review every answer with correct solutions","Track all your past attempts in one place","View teacher-uploaded whiteboard solutions","Clean, distraction-free quiz interface"]},
            ].map((s,i)=>(
              <FadeIn key={s.role} delay={i*120}>
                <TiltCard>
                  <div className="card overflow-hidden h-full">
                    <div className="relative h-44">
                      <img src={s.img} alt={s.role} className="w-full h-full object-cover" style={{filter:"brightness(0.5) saturate(0.5)"}}/>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-70"/>
                      <div className="absolute bottom-4 left-5"><div className="text-3xl mb-1">{s.icon}</div><h3 className="font-display text-2xl font-bold text-stone-900">For {s.role}s</h3></div>
                    </div>
                    <div className="p-6 space-y-2.5">
                      {s.items.map(item=>(
                        <div key={item} className="flex items-center gap-3 text-sm text-stone-600">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${s.check}`}><span className="text-xs">✓</span></div>{item}
                        </div>
                      ))}
                      <div className="pt-4"><Link to="/register" className={`btn-primary w-full py-3 rounded-xl text-sm font-semibold text-center block`}>Join as {s.role} →</Link></div>
                    </div>
                  </div>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="orb w-[350px] h-[350px] bg-indigo-100 opacity-40 top-[20%] right-[-60px]" style={{animationDuration:"15s"}}/>
        <div className="max-w-6xl mx-auto">
          <FadeIn><div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-emerald-600 text-xs font-medium mb-5">✦ How It Works</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">Up and running <span className="text-gradient">in minutes</span></h2>
          </div></FadeIn>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {[
              {label:"👩‍🏫 Teacher flow",color:"text-indigo-600 bg-indigo-50 border-indigo-200",steps:[
                {n:1,t:"Register as a Teacher",d:"Create your account and select the Teacher role. Your dashboard is ready instantly."},
                {n:2,t:"Create a Quiz",d:"Add a title, set the duration, enter student emails, then build your questions."},
                {n:3,t:"Publish & Share the Code",d:"Hit Publish. Your quiz gets a unique 8-character code. Share it with students."},
                {n:4,t:"Review Results & Analytics",d:"See every submission, check per-question accuracy, and upload solution images."},
              ]},
              {label:"🎓 Student flow",color:"text-violet-600 bg-violet-50 border-violet-200",steps:[
                {n:1,t:"Register as a Student",d:"Sign up with your email. The teacher adds you to unlock assigned quizzes."},
                {n:2,t:"Browse or Join by Code",d:"Assigned quizzes appear on your dashboard automatically, or enter the 8-character code."},
                {n:3,t:"Attempt the Quiz",d:"Answer questions within the timer. The system auto-submits when time's up."},
                {n:4,t:"See Your Score Instantly",d:"View your score, correct answers, and marks the moment you submit."},
              ]},
            ].map((flow,fi)=>(
              <div key={flow.label}>
                <FadeIn>
                  <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 text-xs font-medium mb-8 ${flow.color}`}>{flow.label}</div>
                </FadeIn>
                <div className="space-y-7">
                  {flow.steps.map((step,si)=>(
                    <FadeIn key={step.n} delay={si*80}>
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center font-display font-bold text-sm ${flow.color}`}>{step.n}</div>
                        <div><h4 className="font-display font-bold text-stone-900 mb-1">{step.t}</h4><p className="text-sm text-stone-400 leading-relaxed">{step.d}</p></div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="orb w-80 h-80 bg-violet-100 opacity-40 bottom-0 right-[-60px]" style={{animationDuration:"12s"}}/>
        <div className="max-w-3xl mx-auto">
          <FadeIn><div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-indigo-600 text-xs font-medium mb-5">✦ FAQ</div>
            <h2 className="font-display text-4xl font-bold text-stone-900 mb-3">Common questions</h2>
          </div></FadeIn>
          <div className="space-y-3">
            {[
              {q:"Is QuizSpace free to use?",a:"Yes — QuizSpace is completely free for teachers and students. Create an account and start building quizzes in minutes."},
              {q:"How does anti-cheat work?",a:"The platform tracks every tab switch, fullscreen exit, and DevTools open. Counts appear on the teacher's submission review screen. Three strikes auto-submits the quiz."},
              {q:"Can a student attempt a quiz more than once?",a:"No. Once submitted, the attempt is locked. This keeps results fair and prevents repeat attempts."},
              {q:"What question types are supported?",a:"Four types: Multiple Choice (MCQ), True/False, Short Answer, and Fill-in-the-Blank. Mix all four in a single quiz."},
              {q:"How do students access a quiz?",a:"Two ways — assigned quizzes appear automatically on their dashboard, or they enter the 8-character quiz code via 'Join with Code'."},
              {q:"Can teachers see individual student answers?",a:"Yes. On the Submissions page, expand any submission to see the student's answer to every question alongside the correct answer."},
            ].map(f=><FadeIn key={f.q}><FAQ q={f.q} a={f.a}/></FadeIn>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-indigo-200 opacity-35 top-[-60px] left-[50%] -translate-x-1/2" style={{animationDuration:"12s"}}/>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="card p-12 border border-indigo-100">
              {/* Custom SVG illustration — stylised graduation cap + pencil */}
              <div className="flex justify-center mb-8">
                <div className="relative w-24 h-24">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border-2 border-indigo-200"/>
                  {/* Inner SVG */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Graduation cap board */}
                      <path d="M26 10L6 20L26 30L46 20L26 10Z" fill="#4F46E5" fillOpacity="0.15" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round"/>
                      {/* Cap top diamond */}
                      <path d="M26 10L6 20L26 30L46 20L26 10Z" fill="#4F46E5" fillOpacity="0.25"/>
                      {/* Left side of cap */}
                      <path d="M14 24V34C14 34 18 40 26 40C34 40 38 34 38 34V24" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
                      {/* Tassel string */}
                      <path d="M46 20V30" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
                      {/* Tassel ball */}
                      <circle cx="46" cy="32" r="2.5" fill="#6366F1"/>
                      {/* Pencil */}
                      <rect x="31" y="4" width="5" height="14" rx="1" transform="rotate(15 31 4)" fill="#F59E0B" stroke="#D97706" strokeWidth="1"/>
                      <path d="M33.5 17.5L31 21L35.5 19.5L33.5 17.5Z" fill="#1C1917"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-900 mb-4">Ready to get started with <span className="text-gradient">QuizSpace</span>?</h2>
              <p className="text-stone-400 mb-10 max-w-lg mx-auto leading-relaxed">Join teachers and students already using QuizSpace. It takes less than two minutes to create your first quiz.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary px-10 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 justify-center">Create Free Account →</Link>
                <Link to="/login" className="btn-secondary px-10 py-4 rounded-xl font-semibold text-base inline-flex items-center gap-2 justify-center text-stone-700">Sign in</Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8L12 4L20 8L12 12L4 8Z" fill="white" fillOpacity="0.9"/><path d="M4 8V14L12 18L20 14V8" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none"/><line x1="20" y1="8" x2="20" y2="14" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/><circle cx="20" cy="15.5" r="1.5" fill="white" opacity="0.8"/></svg></div>
            <span className="font-display text-lg font-bold text-stone-900">QuizSpace</span>
          </div>
          <div className="flex gap-6 text-sm text-stone-400">
            {[["#features","Features"],["#how-it-works","How It Works"],["#faq","FAQ"]].map(([h,l])=><a key={h} href={h} className="hover:text-stone-600 transition-colors">{l}</a>)}
            <Link to="/login" className="hover:text-stone-600 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-stone-600 transition-colors">Register</Link>
          </div>
          <p className="text-xs text-stone-300">© {new Date().getFullYear()} QuizSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}