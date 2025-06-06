import { Router } from "express";
import { RespondentService } from '../services/respondentService.js';

export async function listRespondents(req, res) {
    try {
        const result = await RespondentService.listRespondents(req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error listing respondents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching respondents'
        });
    }
}

export async function getRespondentById(req, res) {
    try {
        const respondent = await RespondentService.getRespondentById(req.params.id);
        res.json({
            success: true,
            data: { respondent }
        });
    } catch (error) {
        console.error('Error fetching respondent:', error);
        if (error.message === 'Respondent not found') {
            return res.status(404).json({
                success: false,
                message: 'Respondent not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching respondent'
        });
    }
}

export async function createOrUpdateRespondent(req, res) {
    try {
        const respondent = await RespondentService.createOrUpdateRespondent(req.body);
        res.status(201).json({
            success: true,
            message: 'Respondent created/updated successfully',
            data: { respondent }
        });
    } catch (error) {
        console.error('Error creating/updating respondent:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating/updating respondent'
        });
    }
}

