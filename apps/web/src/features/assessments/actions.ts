'use server';
import { redirect } from 'next/navigation';
import { answerQuestion, finishAssessment, startAssessment } from './server/adaptive-assessment';
export async function startDiagnostic(){const id=await startAssessment();redirect(`/app/assessment/session?id=${id}`);}
export async function submitDiagnosticAnswer(formData:FormData){const assessmentId=String(formData.get('assessmentId'));await answerQuestion(assessmentId,{questionVersionId:String(formData.get('questionVersionId')),selectedOptionId:String(formData.get('selectedOptionId')),responseTimeMs:Number(formData.get('responseTimeMs')??0),statedConfidence:String(formData.get('statedConfidence')??'medium')});redirect(`/app/assessment/session?id=${assessmentId}`);}
export async function completeDiagnostic(formData:FormData){const assessmentId=String(formData.get('assessmentId'));await finishAssessment(assessmentId);redirect(`/app/assessment/result?id=${assessmentId}`);}
