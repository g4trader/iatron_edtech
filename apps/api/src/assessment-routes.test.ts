import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { AssessmentRepository } from './assessment-repository.js';
import type { LearningRepository } from './learning-repository.js';
import type { StudentRepository } from './student-repository.js';

const id='70000000-0000-4000-8000-000000000001'; const questionId='71000000-0000-4000-8000-000000000001'; const competencyId='54000000-0000-4000-8000-000000000001';
const summary={ id, objective:'Diagnóstico inicial', status:'active', algorithmVersion:'assessment-v1', durationMinutes:30, questionCount:2, answeredCount:0, startedAt:'2026-07-23T00:00:00Z', completedAt:null };
const result={ id:'72000000-0000-4000-8000-000000000001', assessmentId:id, correctCount:1, answeredCount:1, overallConfidence:.4, diagnosticCoverage:1, algorithmVersion:'assessment-v1', createdAt:'2026-07-23T00:10:00Z', competencies:[{ competencyId, competencyCode:'CARD.1', competencyName:'Competência', mastery:1, confidence:.4, evidenceCount:2, confidenceLevel:'medium' as const, classification:'strong' as const }] };
const assessment: AssessmentRepository={ targetCompetencies:async()=>[competencyId], start:async()=>id, getAssessment:async()=>summary, listHistory:async()=>[summary], listCandidates:async()=>[{ questionVersionId:questionId, stem:'Pergunta?', difficulty:2, themeIds:['theme'], competencyIds:[competencyId], competencies:[{id:competencyId,code:'CARD.1',name:'Competência'}], options:[{id:'73000000-0000-4000-8000-000000000001',label:'A',content:'Resposta A'},{id:'73000000-0000-4000-8000-000000000002',label:'B',content:'Resposta B'}]}], attempted:async()=>({questionIds:[],themeIds:[]}), recordSelection:async()=>undefined, answer:async()=> '74000000-0000-4000-8000-000000000001', finish:async()=>result.id, result:async()=>result };
const learning: LearningRepository={ listCompetencies:async()=>[], listEvidence:async()=>[], listCurrentMastery:async()=>[], listTimeline:async()=>[] };
let app:FastifyInstance|undefined; afterEach(async()=>{await app?.close();app=undefined;});
const build=()=>buildApp({ environment:readEnvironment({NODE_ENV:'test',ENABLE_API_DOCS:'1'}), logger:false, tokenVerifier:async()=>({sub:'user'}), repositoryFactory:()=>({}) as StudentRepository, assessmentRepositoryFactory:()=>assessment, learningRepositoryFactory:()=>learning });
describe('assessment API',()=>{
  it('requires authentication',async()=>{app=await build();expect((await app.inject({method:'POST',url:'/v1/assessments',payload:{objective:'Diagnóstico'}})).statusCode).toBe(401);});
  it('runs start, next, answer, finish and result flow',async()=>{app=await build();const auth={authorization:'Bearer token'};expect((await app.inject({method:'POST',url:'/v1/assessments',headers:auth,payload:{objective:'Diagnóstico inicial',questionCount:2,durationMinutes:30}})).statusCode).toBe(201);expect((await app.inject({method:'GET',url:`/v1/assessments/${id}/next`,headers:auth})).json()).toHaveProperty('selectionReason');expect((await app.inject({method:'POST',url:`/v1/assessments/${id}/answers`,headers:auth,payload:{questionVersionId:questionId,selectedOptionId:'73000000-0000-4000-8000-000000000001',responseTimeMs:10000,statedConfidence:'high'}})).statusCode).toBe(201);expect((await app.inject({method:'POST',url:`/v1/assessments/${id}/finish`,headers:auth})).statusCode).toBe(200);expect((await app.inject({method:'GET',url:`/v1/assessments/${id}/result`,headers:auth})).json().diagnosticCoverage).toBe(1);});
  it.each(['confidence','coverage','competencies'])('serves %s inspection',async(path)=>{app=await build();expect((await app.inject({method:'GET',url:`/v1/assessments/${id}/${path}`,headers:{authorization:'Bearer token'}})).statusCode).toBe(200);});
});
