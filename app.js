(function () {
  'use strict';
  let language = 'en', lastResult = null, exampleActive = false;
  const $ = id => document.getElementById(id);
  const text = {
    en: {
      research:'Research use',eyebrow:'STUDY COMPANION · WEB CALCULATOR',title:'Tadalafil response calculator',lead:"Estimate the probability of patient-reported improvement after 8 weeks under the study's tadalafil regimen.",regimen:'Study regimen: tadalafil 10 mg every other day for 8 weeks · Outcome: GAQ response',inputs:'Pretreatment information',inputHint:'Use the units shown. Derived indices are calculated automatically.',example:'Load example',reset:'Clear all',exampleNote:'Invented example for demonstration; not a study participant.',calculate:'Calculate probability →',requiredHint:'Complete all required fields. Missing values are not filled automatically.',prediction:'PREDICTION',resultTitle:'8-week GAQ response',emptyResult:'Complete the form and calculate to see the estimated probability.',resultNote:'This estimate applies to the study setting. It does not measure an individual treatment effect or provide a prescribing recommendation.',about:'About this model',cohortLabel:'Development cohort',cohort:'623 men · single center',modelLabel:'Model',model:'Elastic net logistic regression',validationLabel:'Validation',validation:'Internal validation only',studyDetails:'Study details & calculation',population:'Developed in PDE5i-naive men with ED who completed 8 weeks of tadalafil 10 mg every other day and had an available outcome. Response means patient-perceived improvement on the Global Assessment Question (GAQ).',method:'The study assessed 41 baseline variables. This calculator automatically derives 6 indices from raw measurements and supplies the 32 required predictors to the locked primary model. Extra lipid measurements are optional and do not enter this model.',precision:'Derived values follow the study precision: BMI, 1 decimal; NLR, LMR and PLR, 2 decimals; MHR, 3 decimals. Internal validation used outer stratified 5-fold cross-validation repeated 5 times, with inner 5-fold tuning.',boundary:'Independent external validation is required before clinical deployment. The model has not been validated for other treatment regimens.',privacy:'Calculations stay in your browser. This calculator does not upload or save your entries.',footer:'Research calculator accompanying the ED–PDE5i prediction study.',select:'Select…',yes:'Yes',no:'No',computed:'CALCULATED FROM YOUR MEASUREMENTS',optional:'Additional study measurements · optional',optionalHint:'These measurements were in the 41-variable study panel but are not needed by the 32-variable primary model.',missing:'Please complete: ',invalid:'Please check the values or score limits for: ',range:'Values outside the configured model input ranges: ',rangeEnd:'. Verify the entries and units. The model is extrapolating for these values.',resultText:'Estimated probability of patient-reported improvement on GAQ after the study regimen.',exampleResult:'Illustrative example. Estimated probability of patient-reported improvement on GAQ after the study regimen.',years:'years',months:'months',points:'points',unselected:'not selected'
    },
    zh: {
      research:'研究用途',eyebrow:'论文配套 · 在线计算器',title:'他达拉非治疗反应预测',lead:'输入治疗前资料，估计研究方案下治疗8周后患者自评改善的概率。',regimen:'研究方案：他达拉非10 mg，隔日一次，共8周 · 结局：GAQ治疗反应',inputs:'治疗前信息',inputHint:'请按标示单位填写，派生指标将自动计算。',example:'载入演示病例',reset:'清空',exampleNote:'此为虚构的演示病例，并非研究中的患者。',calculate:'计算预测概率 →',requiredHint:'请填写全部必需信息；空缺信息不会被自动填补。',prediction:'预测结果',resultTitle:'8周GAQ改善概率',emptyResult:'填写资料后，点击计算查看预测概率。',resultNote:'本概率对应研究中的特定治疗条件，不代表个体治疗因果效应，也不构成用药建议。',about:'模型说明',cohortLabel:'开发队列',cohort:'623名男性 · 单中心',modelLabel:'预测模型',model:'Elastic Net逻辑回归',validationLabel:'验证阶段',validation:'仅完成内部验证',studyDetails:'研究条件与计算说明',population:'模型开发于既往未使用PDE5i、完成他达拉非10 mg隔日一次共8周治疗且有结局记录的ED男性患者。治疗反应指患者在总体评估问题（GAQ）中报告勃起功能改善。',method:'研究共评估41项基线变量。本计算器由原始测量值自动生成6项派生指标，将主模型所需的32项预测变量传入锁定模型。额外的血脂指标可选填，不参与主模型预测。',precision:'派生指标沿用研究数据精度：BMI保留1位小数；NLR、LMR和PLR保留2位小数；MHR保留3位小数。内部验证采用外层分层5折、重复5次，内层分层5折调参的嵌套交叉验证。',boundary:'正式临床部署前需要独立外部验证。其他给药方案下的预测表现尚未经验证。',privacy:'计算在浏览器内完成。本计算器不上传或保存填写的信息。',footer:'ED–PDE5i治疗反应预测研究配套计算器。',select:'请选择…',yes:'有 / 是',no:'无 / 否',computed:'根据填写信息自动计算',optional:'其他研究测量值 · 可选',optionalHint:'这些指标属于研究的41变量集，但32变量主模型无需使用。',missing:'请补充：',invalid:'请核对以下数值或评分范围：',range:'以下变量超出模型配置的输入范围：',rangeEnd:'。请核对数值和单位；模型正在对这些数值进行外推。',resultText:'研究方案治疗8周后，患者在GAQ中报告改善的预测概率。',exampleResult:'演示病例：研究方案治疗8周后，患者在GAQ中报告改善的预测概率。',years:'岁',months:'月',points:'分',unselected:'未选择'
    }
  };
  Object.assign(text.en, {expandAll:'Expand all',collapseAll:'Collapse all',requiredProgress:'Required information',derivedTitle:'Calculated indices',readOnly:'Read only',derivedHint:'Updated automatically from your measurements. No separate entry is needed.',awaiting:'Awaiting data',checkValues:'Check values',notCalculated:'Not calculated',researchSetting:'Research setting only',validCompleted:'valid entries',bmiFormula:'Weight / height²',nlrFormula:'Neutrophils / lymphocytes',lmrFormula:'Lymphocytes / monocytes',plrFormula:'Platelets / lymphocytes',mhrFormula:'Monocytes / HDL-C'});
  Object.assign(text.zh, {expandAll:'展开全部',collapseAll:'收起全部',requiredProgress:'必填信息进度',derivedTitle:'自动计算指标',readOnly:'只读',derivedHint:'根据原始测量值实时更新，无需重复填写。',awaiting:'待完善',checkValues:'请核对数值',notCalculated:'待计算',researchSetting:'仅适用于研究场景',validCompleted:'项有效填写',bmiFormula:'体重 / 身高²',nlrFormula:'中性粒细胞 / 淋巴细胞',lmrFormula:'淋巴细胞 / 单核细胞',plrFormula:'血小板 / 淋巴细胞',mhrFormula:'单核细胞 / HDL-C'});
  Object.assign(text.en,{inputCountNote:'33 required source entries form 32 model predictors; five indices are calculated automatically.',groupEmpty:'Not started',groupPartial:'In progress',groupComplete:'Complete'});
  Object.assign(text.zh,{inputCountNote:'33项原始必填信息组成32项模型变量，其中5项指标由系统自动计算。',groupEmpty:'未填写',groupPartial:'待完善',groupComplete:'已完成'});
  text.en.method='The study assessed 41 baseline variables. The primary model uses 27 directly entered predictors and five calculated indices (BMI, NLR, LMR, PLR and MHR). Six source measurements generate those five indices; together with the 27 direct entries, this makes 33 required raw entries. HDL-C is already included among the 27 direct entries. Extra lipid measurements are optional and do not enter the primary model.';
  text.zh.method='研究共评估41项基线变量。主模型使用27项直接输入变量和5项派生指标（BMI、NLR、LMR、PLR和MHR）。6项原始测量值用于生成这5项指标，加上27项直接输入，共需填写33项原始信息。HDL-C已包含在27项直接输入中，无需重复填写。额外的血脂指标可选填，不参与主模型预测。';
  // [name, English label, Chinese label, unit, optional custom binary labels]
  const groups = [
    {label:['Demographics & anthropometry','人口学与体格'],fields:[
      ['age_years','Age','年龄','years'],['height_cm','Height','身高','cm'],['weight_kg','Weight','体重','kg'],
      ['education_high','Education','文化程度','binary',[['High school or below','高中及以下'],['College or above','大专及以上']]],
      ['employed','Employment','就业状态','binary',[['Not employed / retired','无固定职业／待业／退休'],['Currently employed','当前有职业']]],
      ['urban_residence','Residence','居住地','binary',[['Rural','农村'],['Urban','城镇']]]],derived:[['bmi','BMI','体质指数 BMI',1]]},
    {label:['ED & questionnaires','ED情况与问卷'],fields:[
      ['ed_duration_months','ED duration','ED病程','months'],['baseline_iief5','Baseline IIEF-5','治疗前IIEF-5评分','5–21 points'],['morning_erection','Morning erections','晨勃','binary',[['Absent','无明显晨勃'],['Present','存在晨勃']]],['gad7','GAD-7 score','GAD-7焦虑评分','0–21 points'],['phq9','PHQ-9 score','PHQ-9抑郁评分','0–27 points']]},
    {label:['History, comorbidities & lifestyle','病史、合并症与生活方式'],fields:[
      ['smoking','Smoking','吸烟','binary'],['alcohol','Alcohol consumption','饮酒','binary'],['diabetes','Diabetes','糖尿病','binary'],['hypertension','Hypertension','高血压','binary'],['dyslipidemia','Dyslipidemia','血脂异常','binary'],['cardiovascular_disease','Cardiovascular disease','心血管疾病','binary']]},
    {label:['Glucose & lipids','血糖与血脂'],fields:[
      ['fpg_mmol_L','Fasting plasma glucose','空腹血糖 FPG','mmol/L'],['hba1c_pct','HbA1c','糖化血红蛋白 HbA1c','%'],['tg_mmol_L','Triglycerides','甘油三酯 TG','mmol/L'],['hdlc_mmol_L','HDL-C','高密度脂蛋白胆固醇 HDL-C','mmol/L'],['ldlc_mmol_L','LDL-C','低密度脂蛋白胆固醇 LDL-C','mmol/L']]},
    {label:['Hormones','激素指标'],fields:[
      ['total_testosterone_ng_dL','Total testosterone','总睾酮','ng/dL'],['estradiol_pg_mL','Estradiol','雌二醇 E2','pg/mL'],['prolactin_ng_mL','Prolactin','泌乳素 PRL','ng/mL'],['fsh_mIU_mL','FSH','促卵泡激素 FSH','mIU/mL'],['lh_mIU_mL','LH','黄体生成素 LH','mIU/mL'],['progesterone_ng_mL','Progesterone','孕酮','ng/mL']]},
    {label:['Hematology','血液学指标'],fields:[
      ['wbc_10e9_L','White blood cells','白细胞计数 WBC','×10⁹/L'],['neutrophil_10e9_L','Neutrophils · absolute count','中性粒细胞绝对计数','×10⁹/L'],['lymphocyte_10e9_L','Lymphocytes · absolute count','淋巴细胞绝对计数','×10⁹/L'],['monocyte_10e9_L','Monocytes · absolute count','单核细胞绝对计数','×10⁹/L'],['platelet_10e9_L','Platelets','血小板计数','×10⁹/L']],derived:[['nlr','NLR','NLR',2],['lmr','LMR','LMR',2],['plr','PLR','PLR',2],['mhr','MHR','MHR',3]]}
  ];
  const extra = [['tc_mmol_L','Total cholesterol','总胆固醇 TC','mmol/L'],['vldl_mmol_L','VLDL-C','极低密度脂蛋白胆固醇 VLDL-C','mmol/L']];
  text.en.bmiFormula='Weight (kg) / height (m)²';text.zh.bmiFormula='体重（kg）/ 身高（m）²';
  const primaryDerived=groups.flatMap(g=>g.derived||[]);
  const derivedSources={bmi:['weight_kg','height_cm'],nlr:['neutrophil_10e9_L','lymphocyte_10e9_L'],lmr:['lymphocyte_10e9_L','monocyte_10e9_L'],plr:['platelet_10e9_L','lymphocyte_10e9_L'],mhr:['monocyte_10e9_L','hdlc_mmol_L'],non_hdl_mmol_L:['tc_mmol_L','hdlc_mmol_L']};
  const integerFields=['age_years','ed_duration_months','baseline_iief5','gad7','phq9','platelet_10e9_L'];
  const allFields = groups.flatMap(g=>g.fields).concat(extra);
  const titles = Object.fromEntries(allFields.map(f=>[f[0],f.slice(1,3)]));
  for(const [n,en,zh] of [['bmi','BMI','BMI'],['nlr','NLR','NLR'],['lmr','LMR','LMR'],['plr','PLR','PLR'],['mhr','MHR','MHR']]) titles[n]=[en,zh];
  const t = key => text[language][key];
  const label = n => titles[n]?.[language==='en'?0:1] || n;
  const values = () => Object.fromEntries(allFields.map(f=>[f[0],$(f[0])?.value ?? '']));
  function unit(u){ if(text[language][u]) return t(u); return language==='zh'?u.replace('points','分'):u; }
  function makeField(f, optional = false) {
    const [n,en,zh,u,custom] = f;
    const wrap=document.createElement('div');wrap.className='field';
    const lab=document.createElement('label');lab.htmlFor=n;const name=document.createElement('span');name.className='field-name';name.textContent=language==='en'?en:zh;lab.append(name);
    if(u!=='binary'){const sub=document.createElement('span');sub.className='unit';sub.id='unit-'+n;sub.textContent=unit(u);lab.append(sub);}
    let input;
    if(u==='binary'){
      input=document.createElement('select');const opt=document.createElement('option');opt.value='';opt.textContent=t('select');input.append(opt);
      for(let i=0;i<2;i++){const o=document.createElement('option');o.value=String(i);o.textContent=custom?custom[i][language==='en'?0:1]:t(i?'yes':'no');input.append(o);}
    }else{
      input=document.createElement('input');input.type='number';input.inputMode=integerFields.includes(n)?'numeric':'decimal';input.step=integerFields.includes(n)?'1':'any';input.min=n==='age_years'?'18':n==='baseline_iief5'?'5':'0';
      if(['baseline_iief5','gad7','phq9'].includes(n))input.max=n==='phq9'?'27':'21';
      input.setAttribute('enterkeyhint','next');input.setAttribute('aria-describedby','unit-'+n);
    }
    input.id=n;input.name=n;input.required=!optional;input.autocomplete='off';input.setAttribute('aria-label',(language==='en'?en:zh)+(u==='binary'?'':', '+unit(u)));wrap.append(lab,input);return wrap;
  }
  function makeDerived(specs, primary=false){
    const wrap=document.createElement('div');wrap.className=primary?'derived-grid primary-derived':'derived-grid';
    for(const [n,en,zh] of specs){const cell=document.createElement('div');cell.className='derived-cell';const name=document.createElement('span');name.className='derived-name';name.textContent=primary?n.toUpperCase()+(n==='bmi'?' · kg/m²':''):language==='en'?en:zh;const out=document.createElement('output');out.id='derived-'+n;out.textContent=t('awaiting');out.setAttribute('aria-live','off');out.setAttribute('aria-label',(language==='en'?en:zh)+' '+t('readOnly'));out.setAttribute('for',derivedSources[n].join(' '));const hint=document.createElement('small');hint.textContent=primary?t(n+'Formula'):t('computed');cell.append(name,out,hint);wrap.append(cell);}return wrap;
  }
  function renderFields(previous={},openStates={}){
    $('fields').replaceChildren();
    $('derived-values').replaceChildren(makeDerived(primaryDerived,true));
    groups.forEach((g,i)=>{const details=document.createElement('details');details.className='input-section';details.dataset.group=String(i);details.open=openStates[i]??i===0;details.addEventListener('toggle',renderToggleControl);const summary=document.createElement('summary');const state=document.createElement('span');state.className='group-state';state.id='group-state-'+i;state.dataset.state='empty';state.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='summary-title';name.textContent=g.label[language==='en'?0:1];const progress=document.createElement('span');progress.className='group-progress';progress.id='group-progress-'+i;summary.append(state,name,progress);const grid=document.createElement('div');grid.className='field-grid';g.fields.forEach(f=>grid.append(makeField(f)));details.append(summary,grid);$('fields').append(details);});
    const details=document.createElement('details');details.className='input-section optional';details.dataset.group='optional';details.open=openStates.optional??false;const summary=document.createElement('summary');summary.textContent=t('optional');const hint=document.createElement('p');hint.className='optional-hint';hint.textContent=t('optionalHint');const grid=document.createElement('div');grid.className='field-grid';extra.forEach(f=>grid.append(makeField(f,true)));details.append(summary,hint,grid,makeDerived([['non_hdl_mmol_L','Non-HDL-C (mmol/L)','非HDL-C（mmol/L）',2]]));$('fields').append(details);
    for(const [n,v] of Object.entries(previous))if($(n))$(n).value=v;
    updateDerived();
  }
  function updateDerived(){
    const raw=values(), x=EDCalculator.derive(raw);
    const errors=EDCalculator.validateRaw(raw),invalid=new Set(errors.invalid),incomplete=new Set([...errors.missing,...errors.invalid]);
    for(const [n,,,digits] of primaryDerived.concat([['non_hdl_mmol_L','','',2]])){const out=$('derived-'+n);if(!out)continue;const bad=derivedSources[n].some(source=>invalid.has(source));const missing=derivedSources[n].some(source=>raw[source]==='');const ready=!bad&&!missing&&Number.isFinite(x[n]);out.dataset.state=ready?'ready':bad?'invalid':'pending';out.textContent=ready?x[n].toFixed(digits):t(bad?'checkValues':'awaiting');}
    const count=EDCalculator.rawRequired.filter(n=>!incomplete.has(n)).length,total=EDCalculator.rawRequired.length;
    $('progress').textContent=language==='en'?`${count} / ${total} valid entries`:`${count} / ${total} 项有效填写`;
    $('completion-meter').setAttribute('aria-valuenow',String(count));$('completion-meter').setAttribute('aria-valuetext',$('progress').textContent);$('completion-fill').style.width=`${count/total*100}%`;
    groups.forEach((g,i)=>{const valid=g.fields.filter(f=>!incomplete.has(f[0])).length,entered=g.fields.some(f=>raw[f[0]]!=='');const state=valid===g.fields.length?'complete':entered?'partial':'empty';const stateLabel=t(state==='complete'?'groupComplete':state==='partial'?'groupPartial':'groupEmpty');const icon=$('group-state-'+i);icon.dataset.state=state;icon.textContent=state==='complete'?'✓':'';icon.title=stateLabel;const item=$('group-progress-'+i);item.textContent=`${valid} / ${g.fields.length}`;item.dataset.complete=String(valid===g.fields.length);item.setAttribute('aria-label',`${stateLabel}: ${valid} / ${g.fields.length} ${t('validCompleted')}`);});
    renderToggleControl();
  }
  function renderToggleControl(){const allOpen=[...document.querySelectorAll('.input-section:not(.optional)')].every(d=>d.open);$('expand-all').textContent=t(allOpen?'collapseAll':'expandAll');$('expand-all').setAttribute('aria-expanded',String(allOpen));}
  function renderResult(){
    $('probability').textContent=lastResult?(lastResult.probability*100).toFixed(1):t('notCalculated');$('percent').hidden=!lastResult;$('result-live').dataset.state=lastResult?'ready':'pending';
    $('result-description').textContent=t(lastResult?(exampleActive?'exampleResult':'resultText'):'emptyResult');
    $('probability-fill').style.width=lastResult?`${lastResult.probability*100}%`:'0%';
    $('probability-marker').hidden=!lastResult;$('probability-marker').style.left=lastResult?`${lastResult.probability*100}%`:'0%';
    $('range-note').hidden=!lastResult?.warnings.length;
    if(lastResult?.warnings.length)$('range-note').textContent=t('range')+lastResult.warnings.map(label).join(language==='en'?', ':'、')+t('rangeEnd');
  }
  function clearErrors(){ $('form-error').hidden=true;document.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid')); }
  function displayErrors(errors,focus=false){
    const ids=[...new Set(errors.missing.concat(errors.invalid))];if(!ids.length)return;
    for(const n of ids)$(n).setAttribute('aria-invalid','true');
    $('form-error').textContent=(errors.missing.length?t('missing')+errors.missing.map(label).join(language==='en'?', ':'、')+(language==='en'?'. ':'。'):'')+(errors.invalid.length?t('invalid')+errors.invalid.map(label).join(language==='en'?', ':'、'):'');$('form-error').hidden=false;
    if(focus){const first=$(ids[0]);first.closest('details').open=true;first.focus();}
  }
  function translate(){
    const previous=values(),hadErrors=!$('form-error').hidden,openStates=Object.fromEntries([...document.querySelectorAll('.input-section')].map(d=>[d.dataset.group,d.open]));document.documentElement.lang=language==='en'?'en':'zh-CN';document.title=language==='en'?'ED–PDE5i Response Calculator':'ED–PDE5i治疗反应预测计算器';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    $('language').textContent=language==='en'?'中文':'English';$('language').setAttribute('aria-label',language==='en'?'切换到中文':'Switch to English');renderFields(previous,openStates);clearErrors();if(hadErrors)displayErrors(EDCalculator.validateRaw(previous));renderResult();
  }
  $('calculator-form').addEventListener('input',()=>{exampleActive=false;$('example-note').hidden=true;lastResult=null;clearErrors();updateDerived();renderResult();});
  $('calculator-form').addEventListener('change',()=>{exampleActive=false;$('example-note').hidden=true;lastResult=null;clearErrors();updateDerived();renderResult();});
  $('calculator-form').addEventListener('submit',e=>{
    e.preventDefault();clearErrors();const raw=values(), errors=EDCalculator.validateRaw(raw);
    if(errors.missing.length||errors.invalid.length){lastResult=null;renderResult();displayErrors(errors,true);return;}
    try { lastResult=EDCalculator.score(EDCalculator.derive(raw)); }
    catch { lastResult=null;renderResult();$('form-error').textContent=language==='en'?'Unable to calculate. Please check that measurements and derived ratios are finite and use the indicated units.':'无法计算。请核对测量值、派生比值及单位，避免数值过大或分母过小。';$('form-error').hidden=false;return; }
    renderResult();if(window.innerWidth<=760)$('result-heading').scrollIntoView({behavior:'instant',block:'start'});
  });
  $('example').addEventListener('click',()=>{
    const ex={age_years:50,height_cm:170,weight_kg:70,education_high:1,employed:1,urban_residence:1,ed_duration_months:26,baseline_iief5:14,morning_erection:1,gad7:5,phq9:6,smoking:0,alcohol:0,diabetes:0,hypertension:0,dyslipidemia:0,cardiovascular_disease:0,fpg_mmol_L:5.22,hba1c_pct:5.36,tg_mmol_L:1.29,hdlc_mmol_L:1.29,ldlc_mmol_L:2.87,total_testosterone_ng_dL:502.56,estradiol_pg_mL:29.63,prolactin_ng_mL:7.99,fsh_mIU_mL:5.52,lh_mIU_mL:4.52,progesterone_ng_mL:0.57,wbc_10e9_L:6.35,neutrophil_10e9_L:3.2,lymphocyte_10e9_L:1.8,monocyte_10e9_L:0.4,platelet_10e9_L:220,tc_mmol_L:4.7,vldl_mmol_L:0.59};
    for(const f of allFields)$(f[0]).value=ex[f[0]]??'';exampleActive=true;$('example-note').hidden=false;lastResult=null;clearErrors();updateDerived();renderResult();
  });
  $('reset').addEventListener('click',()=>{$('calculator-form').reset();exampleActive=false;$('example-note').hidden=true;lastResult=null;clearErrors();updateDerived();renderResult();});
  $('expand-all').addEventListener('click',()=>{const sections=[...document.querySelectorAll('.input-section:not(.optional)')];const expand=sections.some(d=>!d.open);sections.forEach(d=>d.open=expand);renderToggleControl();});
  $('language').addEventListener('click',()=>{language=language==='en'?'zh':'en';translate();});
  translate();
})();
