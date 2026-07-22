import { assessmentQuestionSchema, assessmentResultSchema, assessmentSummarySchema } from '@iatron/contracts';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const baseUrl=()=>`${(process.env.NEXT_PUBLIC_API_URL??'http://127.0.0.1:8080/v1').replace(/\/$/,'')}/assessments`;
async function request(path:string,init?:RequestInit){const client=await createClient();const {data}=await client.auth.getSession();if(!data.session)throw new Error('Sessão indisponível.');return fetch(`${baseUrl()}${path}`,{...init,headers:{authorization:`Bearer ${data.session.access_token}`,'content-type':'application/json',...init?.headers},cache:'no-store'});}
export async function startAssessment(){const response=await request('',{method:'POST',body:JSON.stringify({objective:'Diagnóstico inicial de competências',durationMinutes:30,questionCount:10})});if(!response.ok)throw new Error('Não foi possível iniciar o diagnóstico.');return z.object({id:z.uuid()}).parse(await response.json()).id;}
export async function nextQuestion(id:string){const response=await request(`/${id}/next`);if(response.status===204)return null;if(!response.ok)throw new Error('Não foi possível selecionar a próxima questão.');return assessmentQuestionSchema.parse(await response.json());}
export async function answerQuestion(id:string,input:{questionVersionId:string;selectedOptionId:string;responseTimeMs:number;statedConfidence:string}){const response=await request(`/${id}/answers`,{method:'POST',body:JSON.stringify(input)});if(!response.ok)throw new Error('Não foi possível registrar a resposta.');}
export async function finishAssessment(id:string){const response=await request(`/${id}/finish`,{method:'POST',body:'{}'});if(!response.ok)throw new Error('Não foi possível concluir o diagnóstico.');}
export async function assessmentResult(id:string){const response=await request(`/${id}/result`);if(!response.ok)throw new Error('Resultado indisponível.');return assessmentResultSchema.parse(await response.json());}
export async function assessmentHistory(){const response=await request('');if(!response.ok)throw new Error('Histórico indisponível.');return z.array(assessmentSummarySchema).parse(await response.json());}
