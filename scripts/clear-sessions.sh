#!/bin/bash
echo "Cleaning up local development session artifacts..."
rm -rf apps/admin/.next
rm -rf apps/student/.next
echo "Done. Please restart your dev servers."
