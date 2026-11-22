import{j as e,b as R,M as E,F as A,I as T,B as $,q as B}from"./vendor-ui-CtWcUYM7.js";import{r as g}from"./vendor-react-CLRphaez.js";import{M as N,D as _,a as D,L as H,U as P,P as F,e as q}from"./index-Brc1x0up.js";import{u as v,b as y}from"./vendor-apollo-Cd1R17xV.js";function O({messageId:n,messageType:r,writerType:o,currentPage:t}){const[u,a]=g.useState(!1),[i,c]=g.useState(o==="guest"?"":null),m=g.useRef(),{refetch:p}=v(N),[l]=y(_,{onCompleted:({deleteMessage:{success:h}})=>{if(h===!0){p({page:t});return}alert("삭제할 수 없습니다")}}),C=h=>{h.preventDefault(),l({variables:{input:{messageType:r,messageId:n,password:i}}})};return e.jsxs(e.Fragment,{children:[e.jsx(R,{onClick:()=>a(!0)}),e.jsxs(E,{show:u,onHide:()=>{a(!1)},children:[e.jsx(E.Header,{closeButton:!0,children:e.jsx(E.Title,{as:"h5",children:"게시글 삭제"})}),e.jsx(E.Body,{children:e.jsx(A,{ref:m,onSubmit:C,children:e.jsxs(T,{className:"mb-3",children:[o==="guest"?e.jsx(A.Control,{type:"password",placeholder:"비밀번호",maxLength:4,pattern:"[0-9]{1,4}",autoComplete:"one-time-code",required:!0,onChange:h=>c(h.target.value)}):null,e.jsx($,{type:"submit",variant:"outline-secondary",children:"삭제"})]})})})]})]})}function L({content:n,onClick:r}){return e.jsx(U,{dangerouslySetInnerHTML:{__html:n},onClick:r})}const U=B.div`
	max-height: 600px;
	overflow: auto;
`;function G({messageId:n,likes:r}){const{data:o}=v(D),[t]=y(H),[u]=y(P),a=i=>{var c;return i.map(m=>m.userId).includes((c=o==null?void 0:o.me)==null?void 0:c.id)};return e.jsxs(W,{onClick:()=>{if(a(r)){u({variables:{input:{messageId:n}}});return}t({variables:{input:{messageId:n}}})},children:[a(r)?e.jsx("img",{src:"https://jiokkae.com/static/images/bokk//like-on.png",width:"24px",alt:"like"}):e.jsx("img",{src:"https://jiokkae.com/static/images/bokk//like.png",width:"24px",alt:"like"}),(r==null?void 0:r.length)||"좋아요"]})}const W=B.div`
	display: inline-flex;
	cursor: pointer;
	gap: 0.25rem;
	:hover {
		transform: scale(1.1);
	}
`;function I({name:n,type:r}){return e.jsxs(e.Fragment,{children:[n,r==="user"?e.jsx("img",{className:"m-1",src:"https://jiokkae.com/static/images/bokk//네모볶음밥32x32.png",style:{width:"16px"},alt:"회원"}):null]})}function z({messageId:n,currentPage:r}){const[o,t]=g.useState(""),[u,a]=g.useState(""),i=g.useRef(),{data:c}=v(D),[m]=y(F,{refetchQueries:[{query:N,variables:{page:r}}]}),p=l=>{const C=i.current?i.current.value.trim():"";C!==""&&(m({variables:{input:{content:C,writerName:o,password:u,messageId:l}}}),i.current&&(i.current.value=""))};return e.jsxs("div",{className:"bd-reply mt-2",children:[e.jsxs("div",{className:"row g-0",children:[c!=null&&c.me?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"col-4",children:e.jsx("input",{type:"text",className:"form-control",maxLength:"10",required:!0,placeholder:"닉네임",onChange:l=>t(l.target.value)})}),e.jsx("div",{className:"col-4",children:e.jsx("input",{type:"password",className:"form-control",maxLength:"4",pattern:"[0-9]{4,4}",required:!0,placeholder:"비밀번호",autoComplete:"new-password",onChange:l=>a(l.target.value)})})]}),e.jsx("div",{className:"col-auto",children:e.jsx("button",{type:"button",className:"btn bgc-bokk-dark",onClick:()=>p(n),children:"작성"})})]}),e.jsx("div",{className:"row g-0",children:e.jsx("div",{className:"col",children:e.jsx("textarea",{className:"form-control",placeholder:"내용",ref:i})})})]})}function S({writerName:n,writerType:r,writerId:o,userId:t,messageId:u,messageType:a,currentPage:i}){const c=(m,p,l,C)=>p==="guest"&&m!=="----"||p==="user"&&l===C;return e.jsx(e.Fragment,{children:c(n,r,o,t)?e.jsx(O,{messageId:u,messageType:a,writerType:r,currentPage:i}):null})}function K({id:n,content:r,time:o,writer:t,currentPage:u}){var i;const{data:a}=v(D);return e.jsxs("div",{className:"row bd-reply",children:[e.jsx("div",{className:"col-md-0_5 m_hide",children:"┗"}),e.jsx("div",{className:"col-md-7 bd-content",children:e.jsx(L,{content:r})}),e.jsx("div",{className:"col-md-2_5 bd-time retime",children:o}),e.jsx("div",{className:"col-md-1_5 bd-writer",children:e.jsx(I,{name:t==null?void 0:t.name,type:t==null?void 0:t.type})}),e.jsx("div",{className:"col-md-0_5 bd-delete",children:e.jsx(S,{messageId:n,messageType:"reply",userId:(i=a==null?void 0:a.me)==null?void 0:i.id,writerId:t==null?void 0:t.id,writerName:t==null?void 0:t.name,writerType:t==null?void 0:t.type,currentPage:u})})]})}function Y({id:n,content:r,time:o,writer:t,reply:u,likes:a,currentPage:i}){var l;const{data:c}=v(D),[m,p]=g.useState(!1);return e.jsxs("div",{className:"row g-0",children:[e.jsx(Q,{children:n}),e.jsxs("div",{className:"col-md-6_5 bd-content",children:[e.jsx(L,{content:r,onClick:()=>p(!m)}),e.jsx("div",{children:e.jsx(G,{messageId:n,likes:a})})]}),e.jsx("div",{className:"col-md-2 bd-time retime",children:o}),e.jsx("div",{className:"col-md-2 me-auto bd-writer",children:e.jsx(I,{name:t==null?void 0:t.name,type:t==null?void 0:t.type})}),e.jsx("div",{className:"col-md-0_5 bd-delete",children:e.jsx(S,{messageId:n,messageType:"message",userId:(l=c==null?void 0:c.me)==null?void 0:l.id,writerId:t==null?void 0:t.id,writerName:t==null?void 0:t.name,writerType:t==null?void 0:t.type,currentPage:i})}),e.jsxs("div",{className:"message-board p-0 m-0",children:[m?e.jsx(z,{messageId:n,currentPage:i}):null,u==null?void 0:u.map(({id:C,content:h,time:s,writer:d})=>e.jsx(K,{id:C,content:h,time:s,writer:d,currentPage:i},C))]})]})}const Q=B.div`
	flex: 0 0 auto;
	width: 8.33333333%;
	text-align: center;
	padding: 0;
	font-weight: bold;
	background-color: #f3f6f7;
	@media (max-width: 767px) {
		color: #aaa !important;
		padding: 0.25rem !important;
		font-weight: normal !important;
		background-color: #0000 !important;
		font-size: 0.75rem;
		width: auto;
		position: absolute;
	}
`;function V({boardPage:n,totalPage:r,setCurrentPage:o}){const t=u=>{u!==n&&o(u)};return Array.from({length:7},(u,a)=>n-3+a).map(u=>u<1||u>=r?null:e.jsx("li",{className:`page-item ${u===n&&"active"}`,children:e.jsx("button",{className:"page-link",onClick:()=>t(u),children:u})},u))}function J({boardPage:n,totalCount:r,setCurrentPage:o}){const t=r/20+1,u=()=>{n>1&&o(n-1)},a=()=>{n<t-1&&o(n+1)};return e.jsx("nav",{className:"p-4","aria-label":"Page navigation",children:e.jsxs("ul",{className:"pagination justify-content-center",children:[e.jsx(X,{className:`page-item ${n>1||"disabled"}`,children:e.jsx("button",{className:"page-link",onClick:u,children:"이전"})}),e.jsx(V,{boardPage:n,totalPage:t,setCurrentPage:o}),e.jsx(Z,{className:`page-item ${n<t-1||"disabled"}`,children:e.jsx("button",{className:"page-link",onClick:a,children:"다음"})})]})})}const X=B.li`
	word-break: keep-all;
`,Z=B.li`
	word-break: keep-all;
`;function M(n,r,o){return n<=o&&r<=o?{width:n,height:r}:n>r?{width:o,height:Math.round(r*o/n)}:{width:Math.round(n*o/r),height:o}}function ee(n){if(!n||!n.includes("<iframe"))return n;const r=document.createElement("div");return r.innerHTML=n,r.querySelectorAll("iframe").forEach(t=>{const u=t.getAttribute("src");if(u&&u.includes("youtube.com/embed/")){const a=u.match(/embed\/([^?]+)/);if(a){const i=a[1],c=document.createElement("oembed");c.setAttribute("url",`https://www.youtube.com/watch?v=${i}`),t.replaceWith(c)}}}),r.innerHTML}async function te(n,r=1920,o=.85){if(!n||!(n instanceof Blob))throw new Error("유효한 파일이 아닙니다.");if(n.size>15*1024*1024)throw new Error("이미지 파일 크기는 최대 15MB까지 업로드 가능합니다.");const t=n.type==="image/gif"||/\.gif$/i.test(n.name||""),u=n.type==="image/webp"||/\.webp$/i.test(n.name||"");if(t||u){const a=t?"image/gif":"image/webp",i=t?".gif":".webp";let c=n.name||`upload${i}`;return u&&!/\.webp$/i.test(c)&&(c+=".webp"),t&&!/\.gif$/i.test(c)&&(c+=".gif"),new Promise(m=>{const p=new FileReader;p.onload=l=>{const C=new Blob([l.target.result],{type:a});m(new File([C],c,{type:a}))},p.onerror=()=>m(n),p.readAsArrayBuffer(n)})}try{const a=await createImageBitmap(n,{imageOrientation:"from-image"}),{width:i,height:c}=M(a.width,a.height,r),m=document.createElement("canvas");return m.width=i,m.height=c,m.getContext("2d").drawImage(a,0,0,i,c),a.close&&a.close(),new Promise((l,C)=>{m.toBlob(h=>{if(!h)return C("이미지 변환 실패");const s=n.name?n.name.replace(/\.[^/.]+$/,".jpg"):"upload.jpg";l(new File([h],s,{type:"image/jpeg"}))},"image/jpeg",o)})}catch{return new Promise((i,c)=>{if(n.type==="image/heic"||n.type==="image/heif")return c("HEIC(애플 고효율 이미지) 형식은 지원하지 않습니다. 일반 JPG로 변환하여 업로드해주세요.");const m=new FileReader;m.onload=p=>{const l=new Image;l.onload=()=>{const{width:C,height:h}=M(l.width,l.height,r),s=document.createElement("canvas");s.width=C,s.height=h,s.getContext("2d").drawImage(l,0,0,C,h),s.toBlob(f=>{if(!f)return i(n);const b=n.name?n.name.replace(/\.[^/.]+$/,".jpg"):"upload.jpg";i(new File([f],b,{type:"image/jpeg"}))},"image/jpeg",o)},l.onerror=()=>i(n),l.src=p.target.result},m.onerror=()=>i(n),m.readAsDataURL(n)})}}async function ne(n){var i;const r=await te(n,1080,.8),o=new FormData;o.append("upload",r);const a=await(await fetch("https://jiokkae.com/api/upload.php",{method:"POST",body:o})).json();if(a&&a.url)return a.url;throw new Error(((i=a==null?void 0:a.error)==null?void 0:i.message)||"이미지 업로드에 실패했습니다.")}function se({onReady:n,placeholder:r="내용",onUploading:o}){const t=g.useRef(null),u=g.useRef(null),[a,i]=g.useState(Date.now()),c=(s,d=null)=>{document.execCommand(s,!1,d),t.current&&t.current.focus()},m=()=>{const s=prompt(`웹사이트 주소(URL)를 입력하세요.
(예: https://...)`,"");s&&s.trim()!==""&&c("createLink",s.trim())},p=()=>{const s=prompt(`유튜브 동영상 주소(URL)를 입력하세요.
(예: https://www.youtube.com/watch?v=...)`,"");if(!s)return;const d=q(s);if(d){const f=`<div class="ratio ratio-16x9 my-2"><iframe src="https://www.youtube.com/embed/${d}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;t.current&&t.current.focus(),!document.execCommand("insertHTML",!1,f)&&t.current&&(t.current.focus(),t.current.insertAdjacentHTML("beforeend",f))}else alert("올바른 유튜브 동영상 주소가 아닙니다.")},l=async s=>{if(!s)return;const d="img-upload-"+Date.now()+"-"+Math.random().toString(36).substring(2,7),f=URL.createObjectURL(s),b=`<figure class="image my-2"><img id="${d}" src="${f}" alt="업로드 중..." style="max-width: 100%; height: auto; border-radius: 8px; opacity: 0.5; transition: opacity 0.3s;" /></figure><p><br></p>`;o&&o(!0),t.current&&t.current.focus(),!document.execCommand("insertHTML",!1,b)&&t.current&&t.current.insertAdjacentHTML("beforeend",b),await new Promise(x=>setTimeout(x,100));try{const x=await ne(s);if(t.current){const j=t.current.querySelector(`#${d}`);if(j)j.src=x,j.style.opacity="1",j.alt="업로드 이미지",j.removeAttribute("id");else{const k=`<figure class="image my-2"><img src="${x}" alt="업로드 이미지" style="max-width: 100%; height: auto; border-radius: 8px;" /></figure><p><br></p>`;t.current.insertAdjacentHTML("beforeend",k)}}}catch(x){if(alert(typeof x=="string"?x:(x==null?void 0:x.message)||"이미지 업로드 실패"),t.current){const j=t.current.querySelector(`#${d}`);if(j){const k=j.closest("figure");k?k.remove():j.remove()}}}finally{URL.revokeObjectURL(f),i(Date.now()),o&&o(!1)}},C=s=>{var f;const d=(f=s.target.files)==null?void 0:f[0];d&&l(d)},h=(s,d)=>{if(d&&d.length>0){const f=Array.from(d).find(b=>b.type.startsWith("image/"));f&&(s.preventDefault(),l(f))}};return g.useEffect(()=>{n&&t.current&&n({getData:()=>t.current?t.current.innerHTML:"",setData:s=>{t.current&&(t.current.innerHTML=s)},focus:()=>{t.current&&t.current.focus()}})},[n]),e.jsxs(oe,{children:[e.jsxs(ae,{children:[e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:()=>c("bold"),title:"굵게 (Bold)",children:e.jsx("b",{children:"B"})}),e.jsx("span",{className:"divider"}),e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:m,title:"링크 삽입",children:"🔗"}),e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:()=>{var s;return(s=u.current)==null?void 0:s.click()},title:"이미지 업로드",children:"🖼️"}),e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:p,title:"유튜브 동영상 삽입",children:"🎥"}),e.jsx("span",{className:"divider"}),e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:()=>c("undo"),title:"실행 취소",children:"↺"}),e.jsx("button",{type:"button",onMouseDown:s=>s.preventDefault(),onClick:()=>c("redo"),title:"다시 실행",children:"↻"}),e.jsx("input",{type:"file",ref:u,onChange:C,accept:"image/*",style:{display:"none"}},a)]}),e.jsx(re,{ref:t,contentEditable:!0,suppressContentEditableWarning:!0,placeholder:r,onPaste:s=>{var d;return h(s,(d=s.clipboardData)==null?void 0:d.files)},onDrop:s=>{var d;return h(s,(d=s.dataTransfer)==null?void 0:d.files)}})]})}const oe=B.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`,ae=B.div`
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 6px 10px;
	background-color: #f8f9fa;
	border-bottom: 1px solid #e9ecef;
	user-select: none;

	button {
		border: 1px solid #dee2e6;
		background: #ffffff;
		border-radius: 4px;
		padding: 3px 8px;
		font-size: 13px;
		line-height: 1.2;
		color: #495057;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover {
			background-color: #e9ecef;
			color: #212529;
		}

		&:active {
			background-color: #ced4da;
		}
	}

	.divider {
		width: 1px;
		height: 16px;
		background-color: #dee2e6;
		margin: 0 4px;
	}
`,re=B.div`
	min-height: 120px;
	padding: 12px;
	outline: none;
	font-size: 1rem;
	line-height: 1.5;
	color: #212529;

	&:empty:before {
		content: attr(placeholder);
		color: #adb5bd;
		cursor: text;
	}
`;function ue({setWriterName:n,setPassword:r}){return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"col-auto",children:e.jsx("input",{type:"text",className:"form-control mb-2",maxLength:"10",required:!0,placeholder:"닉네임",autoComplete:"off",onChange:o=>n(o.target.value)})}),e.jsx("div",{className:"col-auto",children:e.jsx("input",{type:"password",className:"form-control mb-2",maxLength:"4",pattern:"[0-9]{4,4}",required:!0,placeholder:"비밀번호",inputMode:"numeric",autoComplete:"new-password",onChange:o=>r(o.target.value)})})]})}function ce({setCurrentPage:n}){const[r,o]=g.useState(""),[t,u]=g.useState(""),[a,i]=g.useState(null),[c,m]=g.useState(0),{data:p}=v(D),[l]=y(F,{refetchQueries:[{query:N,variables:{page:1}}]}),C=g.useCallback(d=>{m(f=>d?f+1:f-1)},[]),h=g.useCallback(d=>{i(d)},[]),s=d=>{if(d.preventDefault(),!a)return;const f=a.getData();if(c>0||f.includes('src="blob:')){alert("이미지 업로드가 진행 중입니다. 잠시만 기다려주세요.");return}const b=ee(f),w=/<p>([^/<>]*)<\/p>/g,x=b.replaceAll("&nbsp;"," ").replaceAll(w,"$1 ");if(!x||x.trim()===""||x==="<br>"){a.focus();return}l({variables:{input:{content:x,writerName:r,password:t}}}),n(1),a.setData(""),a.focus()};return e.jsx("div",{className:"bgc-bokk p-2",style:{borderRadius:"5px"},children:e.jsxs("form",{onSubmit:s,children:[e.jsxs("div",{className:"row",children:[p!=null&&p.me?null:e.jsx(ue,{setWriterName:o,setPassword:u}),e.jsx("div",{className:"col-auto",children:e.jsx("button",{type:"submit",className:"btn bgc-bokk-dark",disabled:c>0,children:c>0?"업로드 중...":"작성"})})]}),e.jsx(ie,{children:e.jsx(se,{placeholder:"내용",onUploading:C,onReady:h})})]})})}const ie=B.div`
	width: 100%;
	font-size: 1rem;
	font-weight: 400;
	color: #212529;
	background-color: #fff;
	background-clip: padding-box;
	border: 1px solid #ced4da;
	border-radius: 0.375rem;
	overflow: hidden;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	p {
		margin: 0;
	}
`;function Ce(){var c,m,p;const[n,r]=g.useState(1),o=g.useRef(null),t=l=>{r(l),i()},{data:u,refetch:a}=v(N,{variables:{page:n}}),i=()=>{if(!o.current)return;const l=Math.max(0,o.current.getBoundingClientRect().top+window.scrollY-75);window.scrollTo({top:l,behavior:"smooth"})};return e.jsxs(e.Fragment,{children:[e.jsx("div",{ref:o,name:"top"}),e.jsx(ce,{setCurrentPage:t}),e.jsxs("div",{className:"p-2",children:[e.jsx("button",{className:"btn btn-md bgc-bokk-dark",onClick:()=>a(),children:"새로고침"}),e.jsx("div",{id:"board_table",children:e.jsxs("div",{className:"message-board",children:[e.jsxs("div",{className:"row g-0 table-header",children:[e.jsx("div",{className:"col-md-1 th",children:"글번호"}),e.jsx("div",{className:"col-md-6_5 th",children:"글내용"}),e.jsx("div",{className:"col-md-2 th"}),e.jsx("div",{className:"col-md-2 th",children:"글쓴이"}),e.jsx("div",{className:"col-md-0_5 th"})]}),(m=(c=u==null?void 0:u.messageboard)==null?void 0:c.messages)==null?void 0:m.map(({id:l,content:C,time:h,writer:s,reply:d,likes:f})=>e.jsx(Y,{id:l,content:C,time:h,writer:s,reply:d,likes:f,currentPage:n},l)),e.jsx(J,{boardPage:n,setCurrentPage:t,totalCount:(p=u==null?void 0:u.messageboard)==null?void 0:p.totalCount})]})})]})]})}export{Ce as default};
